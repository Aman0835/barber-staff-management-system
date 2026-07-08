import { Router } from "express";

import authMiddleware  from "../middleware/authMiddleware.js";

import {
    deletePayroll,
    generatePayroll,
    getPayrollByEmployee,
    getPayrollById,
    getPayrollByMonthYear,
    getPayrolls,
    updatePayroll,
} from "../controllers/adminPayrollController.js";

const router = Router();

// Protect all payroll routes
router.use(authMiddleware);

// Generate Payroll
router.post("/generate", generatePayroll);

// Get All Payrolls
router.get("/", getPayrolls);

// Get Payroll By Month & Year
router.get("/month/:month/:year", getPayrollByMonthYear);

// Get Payroll By Employee
router.get("/employee/:employeeId", getPayrollByEmployee);

// Get Payroll By ID
router.get("/:id", getPayrollById);

// Update Payroll
router.put("/:id", updatePayroll);

// Delete Payroll
router.delete("/:id", deletePayroll);

export default router;