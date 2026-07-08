import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import LeaveRequest from "../models/LeaveRequest.js";
import Payroll from "../models/Payroll.js";

const getTodayDate = () => new Date().toISOString().split("T")[0];


// Dashboard Overview

export const getDashboard = async (req, res) => {
  try {
    const [
      totalEmployees,
      activeEmployees,
      todayAttendance,
      pendingLeaves,
      generatedPayrolls,
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: "active" }),
      Attendance.countDocuments({ date: getTodayDate() }),
      LeaveRequest.countDocuments({ status: "pending" }),
      Payroll.countDocuments({ status: "generated" }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        todayAttendance,
        pendingLeaves,
        generatedPayrolls,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Dashboard Statistics

export const getDashboardStats = async (req, res) => {
  try {
    const [
      employeeCount,
      leaveCount,
      payrollCount,
    ] = await Promise.all([
      Employee.countDocuments(),
      LeaveRequest.countDocuments(),
      Payroll.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        employees: employeeCount,
        leaves: leaveCount,
        payrolls: payrollCount,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Attendance Summary

export const getAttendanceSummary = async (req, res) => {
  try {
    const date = getTodayDate();

    const attendance = await Attendance.aggregate([
      {
        $match: {
          date,
        },
      },
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        date,
        attendance,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Payroll Summary

export const getPayrollSummary = async (req, res) => {
  try {
    const payroll = await Payroll.aggregate([
      {
        $group: {
          _id: null,
          totalNetSalary: {
            $sum: "$netSalary",
          },
          totalDeductions: {
            $sum: "$deductions",
          },
          totalOvertimeAmount: {
            $sum: "$overtimeAmount",
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: payroll[0] || {},
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Leave Summary

export const getLeaveSummary = async (req, res) => {
  try {
    const leaves = await LeaveRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Recent Activities

export const getRecentActivities = async (req, res) => {
  try {
    const [
      recentEmployees,
      recentLeaves,
      recentPayrolls,
    ] = await Promise.all([
      Employee.find()
        .sort({ createdAt: -1 })
        .limit(5),

      LeaveRequest.find()
        .sort({ createdAt: -1 })
        .limit(5),

      Payroll.find()
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.status(200).json({
      success: true,
      data: {
        recentEmployees,
        recentLeaves,
        recentPayrolls,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Monthly Dashboard Statistics

export const getMonthlyStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const monthlyStats = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$date" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: monthlyStats,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Employee Growth Chart

export const getEmployeeGrowth = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const employeeGrowth = await Employee.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: employeeGrowth,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Revenue / Salary Chart

export const getRevenueChart = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const revenueChart = await Payroll.aggregate([
      {
        $match: {
          year: currentYear,
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$netSalary",
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: revenueChart[0] || { totalRevenue: 0 },
    }); 
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
