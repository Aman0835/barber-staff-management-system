import { Router } from "express";

import  authMiddleware  from "../middleware/authMiddleware.js";

import {
    approveLeave,
    createLeave,
    deleteLeave,
    getLeaveById,
    getLeaves,
    rejectLeave,
    updateLeave,
} from "../controllers/adminLeaveController.js";

const router = Router();

// Protect all leave routes
router.use(authMiddleware);

// Get all leave requests
router.get("/", getLeaves);

// Get leave by ID
router.get("/:id", getLeaveById);

// Apply Leave
router.post("/", createLeave);

// Update Leave
router.put("/:id", updateLeave);

// Approve Leave
router.patch("/:id/approve", approveLeave);

// Reject Leave
router.patch("/:id/reject", rejectLeave);

// Delete Leave
router.delete("/:id", deleteLeave);

export default router;