import { useState, useEffect } from "react";
import {
    FiUsers, FiCalendar, FiDollarSign, FiCheck, FiX, FiTrendingUp
} from "react-icons/fi";
import toast from "react-hot-toast";
import * as dashboardService from "../../../services/dashboardService";
import * as employeeService from "../../../services/employeeService";
import * as attendanceService from "../../../services/attendanceService";
import * as leaveService from "../../../services/leaveService";

export function useDashboard() {
    const [overview, setOverview] = useState(null);
    const [payrollSummary, setPayrollSummary] = useState(null);
    const [attendanceSummary, setAttendanceSummary] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [leavesList, setLeavesList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [overviewRes, payrollRes, attendanceRes, empRes, allAttendanceRes, leavesRes] = await Promise.all([
                dashboardService.getDashboardOverview(),
                dashboardService.getPayrollSummary(),
                dashboardService.getAttendanceSummary(),
                employeeService.getEmployees({ limit: 100 }),
                attendanceService.getAttendanceList(),
                leaveService.getLeaves()
            ]);
            if (overviewRes.success) setOverview(overviewRes.data);
            if (payrollRes.success) setPayrollSummary(payrollRes.data);
            if (attendanceRes.success) setAttendanceSummary(attendanceRes.data);
            if (empRes.success) setEmployees(empRes.data);
            if (allAttendanceRes.success) setAttendanceLogs(allAttendanceRes.data);
            if (leavesRes.success) setLeavesList(leavesRes.data);
        } catch (error) {
            console.error("Dashboard data extraction error:", error);
            toast.error("Failed to extract real data from backend");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboardData(); }, []);

    const totalEmployees = overview?.totalEmployees ?? employees.length;

    const attList = attendanceSummary?.attendance || [];
    const presentItem = attList.find(item => item._id === "Present");
    const halfDayItem = attList.find(item => item._id === "Half Day");
    const absentItem = attList.find(item => item._id === "Absent");
    const leaveItem = attList.find(item => item._id === "Leave");

    const presentCount = (presentItem?.count || 0) + (halfDayItem?.count || 0);
    const absentCount = absentItem?.count || 0;
    const leaveCount = leaveItem?.count || overview?.pendingLeaves || 0;
    const netPayrollSum = payrollSummary?.totalNetSalary ?? 0;

    const metrics = [
        {
            label: "Total Employees", value: totalEmployees,
            subtext: `${overview?.activeEmployees ?? employees.filter(e => e.status === "active").length} active`,
            growth: "+1 this month", icon: FiUsers, path: "/employees",
            iconBg: "bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30",
            hoverShadow: "hover:shadow-[0_8px_30px_rgba(59,130,246,0.06)]", glowColor: "bg-blue-500/5",
        },
        {
            label: "Present Today", value: presentCount || overview?.todayAttendance || 0,
            subtext: `of ${totalEmployees} scheduled`, growth: "On schedule", icon: FiCheck, path: "/attendance",
            iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
            hoverShadow: "hover:shadow-[0_8px_30px_rgba(16,185,129,0.06)]", glowColor: "bg-emerald-500/5",
        },
        {
            label: "On Leave", value: leaveCount, subtext: "Staff requests", growth: "Approved leaves",
            icon: FiCalendar, path: "/leave",
            iconBg: "bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30",
            hoverShadow: "hover:shadow-[0_8px_30px_rgba(245,158,11,0.06)]", glowColor: "bg-orange-500/5",
        },
        {
            label: "Absent", value: absentCount,
            subtext: absentCount > 0 ? `${absentCount} alerts` : "Full attendance",
            growth: absentCount > 0 ? "Check logs" : "No alerts", icon: FiX, path: "/attendance",
            iconBg: "bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30",
            hoverShadow: "hover:shadow-[0_8px_30px_rgba(239,68,68,0.06)]", glowColor: "bg-red-500/5",
        },
        {
            label: "Monthly Payroll", value: netPayrollSum > 0 ? `₹${netPayrollSum.toLocaleString()}` : "₹0",
            subtext: "Calculated releases", growth: "+3.4%", icon: FiDollarSign, path: "/payroll",
            iconBg: "bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30",
            hoverShadow: "hover:shadow-[0_8px_30px_rgba(168,85,247,0.06)]", glowColor: "bg-purple-500/5",
        },
        {
            label: "Attendance Rate",
            value: presentCount > 0 && totalEmployees > 0 ? `${Math.round((presentCount / totalEmployees) * 100)}%` : "0%",
            subtext: "Average rate", growth: "+1.8%", icon: FiTrendingUp, path: "/attendance",
            iconBg: "bg-cyan-50 text-cyan-600 border border-cyan-100 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-900/30",
            hoverShadow: "hover:shadow-[0_8px_30px_rgba(6,182,212,0.06)]", glowColor: "bg-cyan-500/5",
        },
    ];

    const getWeeklyAttendanceData = () => {
        const today = new Date();
        return Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setDate(today.getDate() - (5 - i));
            const dateStr = d.toISOString().split("T")[0];
            const dayLogs = attendanceLogs.filter(log => log.date === dateStr);
            return {
                name: d.toLocaleDateString("en-US", { weekday: "short" }),
                Present: dayLogs.filter(log => log.status === "Present" || log.status === "Half Day").length,
                Absent: dayLogs.filter(log => log.status === "Absent").length,
                Leave: dayLogs.filter(log => log.status === "Leave").length,
            };
        });
    };

    const getLeaveTypesData = () => {
        let sick = 0, casual = 0, annual = 0, unpaid = 0;
        leavesList.forEach(l => {
            if (l.status === "approved") {
                const reason = (l.reason || "").toLowerCase();
                const duration = Math.ceil((new Date(l.toDate) - new Date(l.fromDate)) / (1000 * 60 * 60 * 24)) + 1;
                if (reason.includes("sick") || reason.includes("doctor") || reason.includes("medical")) sick += duration;
                else if (reason.includes("annual") || reason.includes("vacation") || reason.includes("trip")) annual += duration;
                else if (reason.includes("unpaid")) unpaid += duration;
                else casual += duration;
            }
        });
        return [
            { name: "Sick", value: sick, color: "#f87171" },
            { name: "Casual", value: casual, color: "#fbbf24" },
            { name: "Annual", value: annual, color: "#34d399" },
            { name: "Unpaid", value: unpaid, color: "#9ca3af" },
        ];
    };

    const getTopBarbers = () => {
        return employees
            .map(emp => {
                const empLogs = attendanceLogs.filter(l => l.employeeId === emp.employeeId);
                const presentLogs = empLogs.filter(l => l.status === "Present" || l.status === "Half Day").length;
                const rate = empLogs.length > 0 ? (presentLogs / empLogs.length) : 0;
                return {
                    name: `${emp.firstName} ${emp.lastName}`,
                    specialty: emp.role === "manager" ? "Shop Manager" : "Fade Specialist",
                    rating: empLogs.length > 0 ? (4.5 + (rate * 0.5)).toFixed(1) : "0.0",
                    hasLogs: empLogs.length > 0,
                };
            })
            .filter(item => item.hasLogs)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 3);
    };

    const getTodayShifts = () => {
        const todayStr = new Date().toISOString().split("T")[0];
        const todayLogs = attendanceLogs.filter(log => log.date === todayStr);
        return employees.reduce((acc, emp) => {
            const log = todayLogs.find(l => l.employeeId === emp.employeeId);
            if (log && log.checkIn) {
                acc.push({
                    time: new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    client: `${emp.firstName} ${emp.lastName}`,
                    service: emp.role === "manager" ? "Shop Management Shift" : "Styling Chair Shift",
                    barber: log.status,
                });
            }
            return acc;
        }, []);
    };

    return {
        loading,
        metrics,
        weeklyData: getWeeklyAttendanceData(),
        leaveTypesData: getLeaveTypesData(),
        topBarbers: getTopBarbers(),
        upcomingAppointments: getTodayShifts(),
    };
}
