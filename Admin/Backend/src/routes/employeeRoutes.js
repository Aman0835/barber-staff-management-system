import express from "express";
import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js";
import LeaveRequest from "../models/LeaveRequest.js";
import Holiday from "../models/Holiday.js";
import Attendance from "../models/Attendance.js";

const router = express.Router();
const JWT_SECRET = (process.env.JWT_SECRET || "secretkey").trim();

// Employee auth middleware for these routes
const empAuth = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        let token = null;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.slice(7);
        } else {
            token = req.cookies?.emp_token || null;
        }
        if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

        const decoded = jwt.verify(token, JWT_SECRET);
        req.employee = decoded;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid Token" });
    }
};

import { checkIn, checkOut, requestEarlyCheckout } from "../controllers/adminAttendanceController.js";

router.use(empAuth);

// Attendance routes for employee portal
router.post("/attendance/check-in", checkIn);
router.post("/attendance/check-out", checkOut);
router.post("/attendance/request-early-checkout", requestEarlyCheckout);

// GET /api/employee/profile/me — get own profile
router.get("/profile/me", async (req, res) => {
    try {
        const employee = await Employee.findById(req.employee._id).select("-password");
        if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });
        res.status(200).json({ success: true, data: employee });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PATCH /api/employee/profile/me — update only allowed fields
router.patch("/profile/me", async (req, res) => {
    try {
        const allowed = ["phone", "address", "profileImage"];
        const updates = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }

        const employee = await Employee.findByIdAndUpdate(
            req.employee._id,
            updates,
            { new: true, runValidators: true }
        ).select("-password");

        if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

        res.status(200).json({ success: true, message: "Profile updated", data: employee });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/employee/leaves/my/:employeeId — own leave requests
router.get("/leaves/my/:employeeId", async (req, res) => {
    try {
        // Ensure employee can only see their own leaves (case-insensitive comparison)
        if ((req.params.employeeId || "").toLowerCase() !== (req.employee.employeeId || "").toLowerCase()) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }
        const leaves = await LeaveRequest.find({
            employeeId: { $regex: new RegExp(`^${req.params.employeeId.trim()}$`, "i") }
        }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: leaves.length, data: leaves });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/employee/holidays — all holidays (read-only for employees)
router.get("/holidays", async (req, res) => {
    try {
        const holidays = await Holiday.find().sort({ date: 1 });
        res.status(200).json({ success: true, count: holidays.length, data: holidays });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/employee/attendance/today/:employeeId
router.get("/attendance/today/:employeeId", async (req, res) => {
    try {
        if ((req.params.employeeId || "").toLowerCase() !== (req.employee.employeeId || "").toLowerCase()) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }
        const today = new Date().toISOString().split("T")[0];
        const record = await Attendance.findOne({
            employeeId: { $regex: new RegExp(`^${req.params.employeeId.trim()}$`, "i") },
            date: today
        });
        res.status(200).json({ success: true, data: record });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
