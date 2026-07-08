import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
    createEmployee,
    deleteEmployee,
    getEmployeeById,
    getEmployees,
    updateEmployee,
    updateEmployeeStatus,
} from "../controllers/adminEmployeeController.js";

const router = Router();

// Protect all employee routes
router.use(authMiddleware);

// Get all employees
router.get("/getEmployees", getEmployees);

// Get employee by ID
router.get("/getEmployeeById/:id", getEmployeeById);

// Create employee
router.post("/createEmployee", createEmployee);

// Update employee
router.put("/updateEmployee/:id", updateEmployee);

// Update employee status
router.patch("/updateEmployeeStatus/:id", updateEmployeeStatus);

// Delete employee
router.delete("/deleteEmployee/:id", deleteEmployee);

export default router;