import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEdit2, FiTrash2, FiCheckCircle, FiXCircle, FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import * as employeeService from "../../services/employeeService";
import * as attendanceService from "../../services/attendanceService";

const statusColors = {
    active: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900",
    on_leave: "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900",
    inactive: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
};

const attBadge = {
    Present: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
    "Half Day": "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-400",
    Absent: "bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400",
    Leave: "bg-blue-50 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400",
};

const fmt = (d) => d ? new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "—";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" }) : "—";

export default function EmployeeDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [empRes, attRes] = await Promise.all([
                    employeeService.getEmployeeById(id),
                    attendanceService.getAttendanceList(),
                ]);

                if (empRes.success) {
                    const found = empRes.data;
                    setEmployee(found);
                    // Filter attendance logs for this specific employee
                    const empLogs = (attRes.success ? attRes.data : [])
                        .filter(l => l.employeeId === found.employeeId)
                        .sort((a, b) => new Date(b.date) - new Date(a.date));
                    setLogs(empLogs);
                } else {
                    toast.error("Employee not found");
                }
            } catch {
                toast.error("Failed to load employee");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm(`Delete ${employee.firstName} ${employee.lastName}? This cannot be undone.`)) return;
        try {
            await employeeService.deleteEmployee(employee._id);
            toast.success("Employee removed from directory");
            navigate("/employees");
        } catch {
            toast.error("Failed to delete employee");
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Employee Profile">
                <div className="flex h-64 items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </div>
            </DashboardLayout>
        );
    }

    if (!employee) {
        return (
            <DashboardLayout title="Employee Profile">
                <div className="flex flex-col h-64 items-center justify-center gap-4">
                    <p className="text-slate-400 text-sm">Employee not found.</p>
                    <button onClick={() => navigate("/employees")} className="text-blue-600 text-sm font-semibold hover:underline">
                        ← Back to Directory
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const totalDays = logs.length;
    const present = logs.filter(l => l.status === "Present").length;
    const halfDay = logs.filter(l => l.status === "Half Day").length;
    const absent = logs.filter(l => l.status === "Absent").length;
    const onLeave = logs.filter(l => l.status === "Leave").length;
    const attendanceRate = totalDays > 0 ? ((present + halfDay) / totalDays * 100).toFixed(1) : "—";
    const totalHours = logs.reduce((sum, l) => sum + (l.workingHours || 0), 0).toFixed(1);

    const infoRow = (label, value) => (
        <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <span className="text-xs text-slate-400 dark:text-slate-500">{label}</span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 text-right max-w-[60%] truncate">{value || "—"}</span>
        </div>
    );

    return (
        <DashboardLayout title="Employee Profile" subtitle={`${employee.firstName} ${employee.lastName}`}>
            {/* Back button */}
            <button
                onClick={() => navigate("/employees")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition mb-5"
            >
                <FiArrowLeft /> Back to Directory
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Profile card */}
                <div className="panel-surface rounded-3xl p-6 shadow-sm flex flex-col items-center text-center gap-4">
                    {employee.profileImage ? (
                        <img src={employee.profileImage} alt={employee.firstName} className="h-24 w-24 rounded-2xl object-cover border-2 border-blue-500/20 shadow-md" />
                    ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-50 text-3xl font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                            {employee.firstName?.[0]}{employee.lastName?.[0]}
                        </div>
                    )}

                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{employee.firstName} {employee.lastName}</h2>
                        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold mt-0.5 capitalize">{employee.role}</p>
                        <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase mt-2.5 border ${statusColors[employee.status] || statusColors.inactive}`}>
                            {employee.status}
                        </span>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-3 text-center">
                        <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/20 p-3 border border-slate-100 dark:border-slate-800">
                            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold block">Monthly Pay</span>
                            <strong className="text-sm block mt-1 text-slate-800 dark:text-slate-100">${employee.monthlySalary?.toLocaleString()}</strong>
                        </div>
                        <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/20 p-3 border border-slate-100 dark:border-slate-800">
                            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold block">Employee ID</span>
                            <strong className="text-sm block mt-1 text-slate-800 dark:text-slate-100">{employee.employeeId}</strong>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full mt-1">
                        <button
                            onClick={() => navigate("/employees")}
                            className="flex-1 h-10 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition flex items-center justify-center gap-1.5"
                        >
                            <FiEdit2 className="text-xs" /> Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            className="h-10 w-10 rounded-xl bg-red-50 border border-red-100 text-red-500 flex items-center justify-center hover:bg-red-100 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400 transition"
                            title="Delete Employee"
                        >
                            <FiTrash2 className="text-xs" />
                        </button>
                    </div>
                </div>

                {/* Right: Details + Attendance */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Contact Information */}
                    <div className="panel-surface rounded-3xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Contact Information</h3>
                        {infoRow("Email", employee.email)}
                        {infoRow("Phone", employee.phone)}
                        {infoRow("Gender", employee.gender)}
                        {infoRow("Address", employee.address)}
                    </div>

                    {/* Employment Details */}
                    <div className="panel-surface rounded-3xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Employment Details</h3>
                        {infoRow("Employee Code", employee.employeeId)}
                        <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-xs text-slate-400 dark:text-slate-500">Login Password</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                                    {showPassword ? (employee.visiblePassword || "Pass1234!") : "••••••••"}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <FiEyeOff className="text-xs" /> : <FiEye className="text-xs" />}
                                </button>
                            </div>
                        </div>
                        {infoRow("Role", employee.role)}
                        {infoRow("Status", employee.status)}
                        {infoRow("Joining Date", employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null)}
                        {infoRow("Member Since", new Date(employee.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }))}
                    </div>
                </div>
            </div>

            {/* Attendance Summary */}
            <div className="mt-6 panel-surface rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-5">Attendance Summary (All Time)</h3>

                {totalDays === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">No attendance records found for this employee.</p>
                ) : (
                    <>
                        {/* Stats Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                            {[
                                { label: "Total Days", value: totalDays, color: "text-slate-800 dark:text-slate-100" },
                                { label: "Present", value: present, color: "text-emerald-600 dark:text-emerald-400" },
                                { label: "Half Day", value: halfDay, color: "text-yellow-600 dark:text-yellow-400" },
                                { label: "Absent", value: absent, color: "text-red-500 dark:text-red-400" },
                                { label: "On Leave", value: onLeave, color: "text-blue-500 dark:text-blue-400" },
                                { label: "Attendance %", value: `${attendanceRate}%`, color: "text-blue-600 dark:text-blue-400" },
                            ].map(s => (
                                <div key={s.label} className="rounded-2xl bg-slate-50 dark:bg-slate-950/20 p-3 border border-slate-100 dark:border-slate-800 text-center">
                                    <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold block">{s.label}</span>
                                    <strong className={`text-base block mt-1 ${s.color}`}>{s.value}</strong>
                                </div>
                            ))}
                        </div>

                        {/* Log Table */}
                        <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-950/30 text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">
                                        <th className="px-4 py-3 text-left">Date</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Check In</th>
                                        <th className="px-4 py-3 text-left">Check Out</th>
                                        <th className="px-4 py-3 text-left">Hours</th>
                                        <th className="px-4 py-3 text-left">Overtime</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {logs.map((log) => (
                                        <tr key={log._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                {fmtDate(log.date)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${attBadge[log.status] || attBadge.Absent}`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                {log.checkIn ? (
                                                    <span className="flex items-center gap-1">
                                                        <FiCheckCircle className="text-emerald-500 shrink-0" />
                                                        {fmt(log.checkIn)}
                                                    </span>
                                                ) : "—"}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                {log.checkOut ? (
                                                    <span className="flex items-center gap-1">
                                                        <FiXCircle className="text-red-400 shrink-0" />
                                                        {fmt(log.checkOut)}
                                                    </span>
                                                ) : "—"}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-semibold">
                                                {log.workingHours > 0 ? `${log.workingHours}h` : "—"}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                                {log.overtime > 0 ? (
                                                    <span className="text-amber-600 dark:text-amber-400 font-semibold">+{log.overtime}h</span>
                                                ) : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <p className="text-[10px] text-slate-400 mt-3 text-right">
                            Total hours logged: <strong className="text-slate-600 dark:text-slate-300">{totalHours}h</strong>
                        </p>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
