import { Router } from "express";

import authMiddleware  from "../middleware/authMiddleware.js";

import {
    createHoliday,
    deleteHoliday,
    getHolidayById,
    getHolidays,
    updateHoliday,
} from "../controllers/adminHolidayController.js";

const router = Router();

// Protect all holiday routes
router.use(authMiddleware);

// Get all holidays
router.get("/", getHolidays);

// Get holiday by ID
router.get("/:id", getHolidayById);

// Create holiday
router.post("/", createHoliday);

// Update holiday
router.put("/:id", updateHoliday);

// Delete holiday
router.delete("/:id", deleteHoliday);

export default router;