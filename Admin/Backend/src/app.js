import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js";

import attendanceRoutes from "./routes/adminAttendanceRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import dashboardRoutes from "./routes/adminDashboardRoutes.js";
import employeeRoutes from "./routes/adminEmployeeRoutes.js";
import holidayRoutes from "./routes/adminHolidayRoutes.js";
import leaveRoutes from "./routes/adminLeaveRoutes.js";
import payrollRoutes from "./routes/adminPayrollRoutes.js";
import reportRoutes from "./routes/adminReportRoutes.js";



dotenv.config();

const app = express();




app.use(express.json());
app.use(cookieParser());

app.use(morgan("dev")); // for development purpose



app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);


app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "CRM Backend Live  && Healthy",
  });
});

app.use("/api/admin/auth", adminAuthRoutes);


app.use("/api/admin/dashboard", dashboardRoutes);

app.use("/api/admin/employees", employeeRoutes);

app.use("/api/admin/attendance", attendanceRoutes);

app.use("/api/admin/leaves", leaveRoutes);

app.use("/api/admin/payroll", payrollRoutes);

app.use("/api/admin/holidays", holidayRoutes);

app.use("/api/admin/reports", reportRoutes);


const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(" Database Connection Failed");
    console.error(err);
  });