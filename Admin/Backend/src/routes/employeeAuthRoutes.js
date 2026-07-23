import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Employee from "../models/Employee.js";

const router = express.Router();
const JWT_SECRET = (process.env.JWT_SECRET || "secretkey").trim();

// Helper: extract token from cookie OR Authorization header
const extractToken = (req) => {
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.slice(7);
    }
    return req.cookies?.emp_token || null;
};

// POST /api/employee/auth/login
router.post("/login", async (req, res) => {
    try {
        const { emailOrId, password } = req.body;

        if (!emailOrId || !password) {
            return res.status(400).json({ success: false, message: "Email/ID and password are required" });
        }

        // Find employee by email or employeeId
        const employee = await Employee.findOne({
            $or: [
                { email: emailOrId.toLowerCase().trim() },
                { employeeId: emailOrId.trim() },
            ],
        });

        if (!employee) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        if (employee.status === "inactive") {
            return res.status(403).json({ success: false, message: "Your account is inactive. Contact admin." });
        }

        // Generate JWT
        const token = jwt.sign({ _id: employee._id, employeeId: employee.employeeId, role: employee.role }, JWT_SECRET, {
            expiresIn: "7d",
        });

        // Set HTTP-only cookie
        res.cookie("emp_token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            success: true,
            message: "Login Successful",
            token,
            employee: {
                _id: employee._id,
                employeeId: employee.employeeId,
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email,
                phone: employee.phone,
                gender: employee.gender,
                role: employee.role,
                joiningDate: employee.joiningDate,
                monthlySalary: employee.monthlySalary,
                profileImage: employee.profileImage,
                address: employee.address,
                status: employee.status,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/employee/auth/me
router.get("/me", async (req, res) => {
    try {
        const token = extractToken(req);
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const employee = await Employee.findById(decoded._id).select("-password");

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        res.status(200).json({ success: true, employee });
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid Token" });
    }
});

// POST /api/employee/auth/logout
router.post("/logout", (req, res) => {
    res.clearCookie("emp_token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    res.status(200).json({ success: true, message: "Logout Successful" });
});

// PATCH /api/employee/auth/change-password
router.patch("/change-password", async (req, res) => {
    try {
        const token = extractToken(req);
        if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

        const decoded = jwt.verify(token, JWT_SECRET);
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Both passwords are required" });
        }

        const employee = await Employee.findById(decoded._id);
        if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

        const isMatch = await bcrypt.compare(currentPassword, employee.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }

        employee.password = await bcrypt.hash(newPassword, 12);
        await employee.save();

        res.status(200).json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
