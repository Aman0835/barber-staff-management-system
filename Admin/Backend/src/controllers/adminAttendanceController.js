import Attendance from "../models/Attendance.js";


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


// Check In

export const checkIn = async (req, res) => {
  try {
    const { employeeId } = req.body;

    const today = new Date().toISOString().split("T")[0];

    let attendance = await Attendance.findOne({
      employeeId,
      date: today,
    });

    if (attendance) {
      return res.status(400).json({
        success: false,
        message: "Already checked in today",
      });
    }

    attendance = await Attendance.create({
      employeeId,
      date: today,
      checkIn: new Date(),
      status: "present",
    });

    res.status(201).json({
      success: true,
      message: "Check In Successful",
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


// Check Out

export const checkOut = async (req, res) => {
  try {
    const { employeeId } = req.body;

    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({
      employeeId,
      date: today,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    attendance.checkOut = new Date();

    attendance.workingHours =
      (attendance.checkOut - attendance.checkIn) /
      (1000 * 60 * 60);

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


// Get All Attendance

export const getAttendanceList = async (req, res) => {
  try {
    const attendance = await Attendance.find().sort({
      date: -1,
      createdAt: -1,
    });

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
    const attendance = await Attendance.find({
      employeeId: req.params.employeeId,
    }).sort({
      date: -1,
    });

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


// Get Today's Attendance

export const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.find({
      date: today,
    }).sort({
      createdAt: -1,
    });

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

//get Attendance Report

export const getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const attendance = await Attendance.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).sort({
      date: -1,
    });

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

// Update Attendance

export const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance updated",
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
    const attendance = await Attendance.findByIdAndDelete(
      req.params.id
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
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