import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import LeaveRequest from "../models/LeaveRequest.js";
import Payroll from "../models/Payroll.js";


// Attendance Report

export const getAttendanceReport = async (req, res) => {
  try {
    const attendance = await Attendance.find().sort({
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


// Payroll Report

export const getPayrollReport = async (req, res) => {
  try {
    const payrolls = await Payroll.find().sort({
      year: -1,
      month: -1,
    });

    res.status(200).json({
      success: true,
      count: payrolls.length,
      data: payrolls,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Leave Report

export const getLeaveReport = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: leaves.length,
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


// Employee Report

export const getEmployeeReport = async (req, res) => {
  try {
    const employees = await Employee.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Monthly Report

export const getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    const attendance = await Attendance.find(
      month && year
        ? {
            date: new RegExp(`^${year}-(0?${month}|${month})`),
          }
        : {}
    );

    const payrolls = await Payroll.find(
      month && year
        ? {
            month: Number(month),
            year: Number(year),
          }
        : {}
    );

    const leaves = await LeaveRequest.find();

    res.status(200).json({
      success: true,
      data: {
        month: month || null,
        year: year || null,
        attendance,
        payrolls,
        leaves,
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


// Custom Report

export const getCustomReport = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      filters: req.query,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};