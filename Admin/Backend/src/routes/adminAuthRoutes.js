import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Helper: extract token from cookie OR Authorization header
const extractToken = (req) => {
  // 1. Try Authorization: Bearer <token>
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  // 2. Fallback: cookie (works if same-site)
  return req.cookies?.token || null;
};

// Login
router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    const token = jwt.sign(
      { email, role: "admin" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Still set cookie as fallback for same-site setups
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Also return token in body so frontend can store in localStorage
    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,                          // ← frontend stores this
      admin: { email, role: "admin" },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Current Admin — accepts Authorization header OR cookie
router.get("/", (req, res) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ success: true, admin: decoded });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid Token" });
  }
});

// Logout
router.delete("/", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  // Client is responsible for removing the localStorage token
  res.status(200).json({ success: true, message: "Logout Successful" });
});

export default router;