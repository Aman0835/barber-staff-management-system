import Attendance from "../models/Attendance.js";
import Settings from "../models/Settings.js";
import Notification from "../models/Notification.js";

// Create Attendance
export const createAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.create(req.body);

    res.status(201).json({
      success: true,
      message: "Attendance created successfully",
      data: attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Check In with Shift Start Time Evaluation
export const checkIn = async (req, res) => {
  try {
    const rawId = (req.body.employeeId || "").trim();
    if (!rawId) {
      return res.status(400).json({ success: false, message: "Employee ID is required" });
    }

    const searchRegex = new RegExp(`^${rawId}$`, "i");
    const today = new Date().toISOString().split("T")[0];

    let attendance = await Attendance.findOne({
      employeeId: { $regex: searchRegex },
      date: today,
    });

    if (attendance) {
      return res.status(400).json({
        success: false,
        message: "Already checked in today",
      });
    }

    // Retrieve active shift settings
    const settings = (await Settings.findOne()) || { checkInTime: "09:00", checkOutTime: "20:00" };

    const now = new Date();
    const [targetHour, targetMin] = (settings.checkInTime || "09:00").split(":").map(Number);
    const targetCheckInDate = new Date(now);
    targetCheckInDate.setHours(targetHour || 9, targetMin || 0, 0, 0);

    // Flag as "Late" if checked in after configured check-in time
    const status = now > targetCheckInDate ? "Late" : "Present";

    attendance = await Attendance.create({
      employeeId: rawId,
      date: today,
      checkIn: now,
      status,
    });

    if (status === "Late") {
      await Notification.create({
        recipientRole: "admin",
        title: "Late Check-in Alert",
        message: `Employee (${employeeId}) checked in late at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        type: "attendance",
      });
    }

    res.status(201).json({
      success: true,
      message: status === "Late" ? "Check In Successful (Marked Late)" : "Check In Successful",
      data: attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Check Out with Standard Working Hours Enforcement & Early Approval Check
export const checkOut = async (req, res) => {
  try {
    const rawId = (req.body.employeeId || "").trim();
    if (!rawId) {
      return res.status(400).json({ success: false, message: "Employee ID is required" });
    }

    const searchRegex = new RegExp(`^${rawId}$`, "i");
    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({
      employeeId: { $regex: searchRegex },
      date: today,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found for today",
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: "Already checked out for today",
      });
    }

    const now = new Date();
    const settings = (await Settings.findOne()) || { checkOutTime: "20:00" };
    const [targetOutHour, targetOutMin] = (settings.checkOutTime || "20:00").split(":").map(Number);
    const targetCheckOutDate = new Date(now);
    targetCheckOutDate.setHours(targetOutHour || 20, targetOutMin || 0, 0, 0);

    // Enforce Working Hours / Standard Checkout Time Rule
    if (now < targetCheckOutDate) {
      // Trying to checkout early before standard checkout time!
      if (attendance.earlyCheckoutStatus !== "approved") {
        return res.status(400).json({
          success: false,
          requiresEarlyApproval: true,
          earlyCheckoutStatus: attendance.earlyCheckoutStatus,
          message: `Check-out restricted! Standard shift check-out is at ${settings.checkOutTime || '08:00 PM'}. Please submit an Early Checkout Request for Admin Approval.`,
        });
      }
    }

    // Checkout allowed
    attendance.checkOut = now;

    // Calculate total working hours
    const totalWorkingHours = (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60);
    attendance.workingHours = Math.max(0, Number(totalWorkingHours.toFixed(2)));

    // Calculate overtime hours if check-out time is past standard check-out time
    if (now > targetCheckOutDate) {
      const overtimeDiff = (now - targetCheckOutDate) / (1000 * 60 * 60);
      attendance.overtime = Math.max(0, Number(overtimeDiff.toFixed(2)));
    } else {
      attendance.overtime = 0;
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Check Out Successful",
      data: attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Employee Request Early Checkout
export const requestEarlyCheckout = async (req, res) => {
  try {
    const { employeeId, reason } = req.body;
    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({ employeeId, date: today });
    if (!attendance) {
      return res.status(404).json({ success: false, message: "No active check-in found for today." });
    }

    attendance.earlyCheckoutStatus = "requested";
    attendance.earlyCheckoutReason = reason || "Personal reason";
    await attendance.save();

    // Create Notification for Admin
    await Notification.create({
      recipientRole: "admin",
      title: "Early Checkout Request",
      message: `Employee (${employeeId}) requested early checkout: "${reason || 'Personal reason'}".`,
      type: "attendance",
    });

    res.status(200).json({
      success: true,
      message: "Early checkout request submitted to Admin for approval.",
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Approve Early Checkout
export const approveEarlyCheckout = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({ success: false, message: "Attendance record not found" });
    }

    const now = new Date();
    attendance.earlyCheckoutStatus = "approved";
    attendance.checkOut = now;

    // Calculate working hours
    const totalWorkingHours = (now - attendance.checkIn) / (1000 * 60 * 60);
    attendance.workingHours = Math.max(0, Number(totalWorkingHours.toFixed(2)));
    if (attendance.workingHours < 5) {
      attendance.status = "Half Day";
    }

    await attendance.save();

    // Notify Employee
    await Notification.create({
      recipientRole: "employee",
      employeeId: attendance.employeeId,
      title: "Early Checkout Approved",
      message: "Your early checkout request has been approved by admin. You are now checked out.",
      type: "attendance",
    });

    res.status(200).json({
      success: true,
      message: "Early checkout approved and employee checked out.",
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Reject Early Checkout
export const rejectEarlyCheckout = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({ success: false, message: "Attendance record not found" });
    }

    attendance.earlyCheckoutStatus = "rejected";
    await attendance.save();

    // Notify Employee
    await Notification.create({
      recipientRole: "employee",
      employeeId: attendance.employeeId,
      title: "Early Checkout Request Rejected",
      message: "Your early checkout request was rejected by admin. Please complete your full shift.",
      type: "attendance",
    });

    res.status(200).json({
      success: true,
      message: "Early checkout request rejected.",
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Attendance
export const getAttendanceList = async (req, res) => {
  try {
    const attendance = await Attendance.find().sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Today Attendance
export const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const attendance = await Attendance.find({ date: today });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Attendance By Employee
export const getAttendanceByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const attendance = await Attendance.find({ employeeId }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Attendance Report
export const getAttendanceReport = async (req, res) => {
  try {
    const attendance = await Attendance.find();
    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Attendance
export const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Attendance
export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};