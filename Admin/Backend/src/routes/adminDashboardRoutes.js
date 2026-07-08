import { Router } from "express";

import authMiddleware  from "../middleware/authMiddleware.js";

import {
    getAttendanceSummary,
    getDashboard,
    getDashboardStats,
    getEmployeeGrowth,
    getLeaveSummary,
    getMonthlyStats,
    getPayrollSummary,
    getRecentActivities,
    getRevenueChart,
} from "../controllers/adminDashboardController.js";

const router = Router();

// Protect all dashboard routes
router.use(authMiddleware);

// Dashboard Overview
router.get("/", getDashboard);

// Statistics Cards
router.get("/stats", getDashboardStats);

// Attendance Summary
router.get("/attendance-summary", getAttendanceSummary);

// Payroll Summary
router.get("/payroll-summary", getPayrollSummary);

// Leave Summary
router.get("/leave-summary", getLeaveSummary);

// Recent Activities
router.get("/recent-activities", getRecentActivities);

// Monthly Dashboard Statistics
router.get("/monthly-stats", getMonthlyStats);

// Employee Growth Chart
router.get("/employee-growth", getEmployeeGrowth);

// Revenue / Salary Chart
router.get("/revenue-chart", getRevenueChart);

export default router;