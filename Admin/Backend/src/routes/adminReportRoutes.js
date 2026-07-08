import { Router } from "express";

import authMiddleware  from "../middleware/authMiddleware.js";

import {
  getAttendanceReport,
  getCustomReport,
  getEmployeeReport,
  getLeaveReport,
  getMonthlyReport,
  getPayrollReport,
} from "../controllers/adminReportController.js";

const router = Router();

// Protect all report routes
router.use(authMiddleware);

// Attendance Report
router.get("/attendance", getAttendanceReport);

// Payroll Report
router.get("/payroll", getPayrollReport);

// Leave Report
router.get("/leave", getLeaveReport);

// Employee Report
router.get("/employee", getEmployeeReport);

// Monthly Report
router.get("/monthly", getMonthlyReport);

// Custom Report
router.get("/custom", getCustomReport);

export default router;