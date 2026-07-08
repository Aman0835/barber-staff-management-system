import { Router } from "express";

import {
    checkIn,
    checkOut,
    createAttendance,
    deleteAttendance,
    getAttendanceByEmployee,
    getAttendanceList,
    getAttendanceReport,
    getTodayAttendance,
    updateAttendance,
} from "../controllers/adminAttendanceController.js";

import  authMiddleware  from "../middleware/authMiddleware.js";

const router = Router();

// Protect all attendance routes
router.use(authMiddleware);

// Get all attendance
router.get("/", getAttendanceList);

// Today's attendance
router.get("/today", getTodayAttendance);

// Attendance Report
router.get("/report", getAttendanceReport);

// Employee Attendance
router.get("/employee/:employeeId", getAttendanceByEmployee);

// Create Attendance
router.post("/", createAttendance);

// Check In
router.post("/check-in", checkIn);

// Check Out
router.post("/check-out", checkOut);

// Update Attendance
router.put("/:id", updateAttendance);

// Delete Attendance
router.delete("/:id", deleteAttendance);

export default router;