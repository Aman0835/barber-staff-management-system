import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
    FiActivity,
    FiArrowRight,
    FiCalendar,
    FiCheck,
    FiClock,
    FiLogIn,
    FiLogOut,
    FiWifi,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { checkIn, checkOut } from "../../services/attendanceService";
import { useDashboard } from "./hooks/useDashboard";

function formatTime(value) {
    if (!value) return "--:--";
    return new Date(value).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

function formatHourMinutes(totalHours = 0) {
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    return `${hours}h ${minutes}m`;
}

function formatMoney(value) {
    if (!value) return "₹0.0k";
    return `₹${(Number(value) / 1000).toFixed(1)}k`;
}

function formatDateLabel(value = new Date()) {
    return value.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
}

function formatMonthLabel(month, year) {
    if (!month || !year) {
        return formatDateLabel(new Date()).split(",").slice(1).join(",").trim();
    }

    return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning,";
    if (hour < 17) return "Good afternoon,";
    return "Good evening,";
}

function ActionButton({ icon: Icon, label, tone, onClick, disabled }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={[
                "flex h-[88px] flex-1 flex-col items-center justify-center rounded-[20px] text-center shadow-[0_16px_32px_rgba(0,0,0,0.18)] transition",
                disabled ? "cursor-not-allowed opacity-70" : "active:scale-[0.98]",
                tone,
            ].join(" ")}
        >
            <Icon className="mb-3 h-7 w-7 text-white" />
            <span className="text-[15px] font-bold text-white">{label}</span>
        </button>
    );
}

function SummaryCard({ value, label, note, valueColor, tone }) {
    return (
        <div className={["flex-1 rounded-[22px] border p-4", tone].join(" ")}>
            <div className={["text-[22px] font-black leading-none", valueColor].join(" ")}>{value}</div>
            <div className="mt-3 text-[13px] font-bold text-white">{label}</div>
            <div className="mt-1 text-[12px] text-[#6f88b1]">{note}</div>
        </div>
    );
}

function ActivityRow({ icon: Icon, title, time, tone }) {
    return (
        <div className="flex items-center gap-4 rounded-[20px] bg-[#1a2438] px-4 py-4">
            <div className={["flex h-11 w-11 items-center justify-center rounded-full", tone].join(" ")}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
                <p className="text-[15px] font-bold text-white">{title}</p>
            </div>
            <p className="text-[13px] text-[#6f88b1]">{time}</p>
        </div>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const { employee } = useAuth();
    const [attendanceAction, setAttendanceAction] = useState("");
    const {
        todayAttendance,
        presentDays,
        leaves,
        latestPayroll,
        recentAttendance,
        fetchAll,
    } = useDashboard();

    const checkedIn = Boolean(todayAttendance?.checkIn);
    const checkedOut = Boolean(todayAttendance?.checkOut);
    const approvedLeaves = leaves.filter((leave) => leave.status === "approved").length;
    const workedHours = todayAttendance?.workingHours ?? 0;
    const overtime = Math.max(workedHours - 8, 0);
    const currentTime = new Date();
    const initials = `${employee?.firstName?.[0] ?? ""}${employee?.lastName?.[0] ?? ""}`.toUpperCase() || "EM";

    const activityItems = useMemo(() => {
        const records = recentAttendance.flatMap((item) => {
            const entry = [];

            if (item.checkIn) {
                entry.push({
                    key: `${item._id}-in`,
                    icon: FiLogIn,
                    title: "Checked In",
                    time: formatTime(item.checkIn),
                    tone: "bg-[#113946] text-[#11d39a]",
                });
            }

            if (item.checkOut) {
                entry.push({
                    key: `${item._id}-out`,
                    icon: FiActivity,
                    title: "Checked Out",
                    time: formatTime(item.checkOut),
                    tone: "bg-[#162f53] text-[#50a0ff]",
                });
            }

            if (!item.checkIn && item.status === "Absent") {
                entry.push({
                    key: `${item._id}-absent`,
                    icon: FiClock,
                    title: "Marked Absent",
                    time: new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                    }),
                    tone: "bg-[#3b1f27] text-[#ff6b78]",
                });
            }

            return entry;
        });

        if (records.length) return records.slice(0, 3);

        return [
            {
                key: "empty",
                icon: FiCheck,
                title: "No recent activity yet",
                time: "--:--",
                tone: "bg-[#1f3250] text-[#79a7ff]",
            },
        ];
    }, [recentAttendance]);

    const handleCheckIn = async () => {
        if (!employee?.employeeId || checkedIn) return;

        setAttendanceAction("check-in");
        try {
            await checkIn(employee.employeeId);
            toast.success("Checked in successfully");
            await fetchAll();
        } catch (error) {
            toast.error(error?.response?.data?.message ?? "Check-in failed");
        } finally {
            setAttendanceAction("");
        }
    };

    const handleCheckOut = async () => {
        if (!employee?.employeeId || !checkedIn || checkedOut) return;

        setAttendanceAction("check-out");
        try {
            await checkOut(employee.employeeId);
            toast.success("Checked out successfully");
            await fetchAll();
        } catch (error) {
            toast.error(error?.response?.data?.message ?? "Check-out failed");
        } finally {
            setAttendanceAction("");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-5 pb-4 pt-2">
                <div className="px-1">
                    <p className="text-[14px] text-[#7d93ba]">{getGreeting()}</p>
                    <div className="mt-1 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => navigate("/profile")}
                                className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#1d2840]"
                            >
                                {employee?.profileImage ? (
                                    <img
                                        src={employee.profileImage}
                                        alt={`${employee?.firstName ?? "Employee"} profile`}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#374764] text-sm font-bold text-white">
                                        {initials}
                                    </div>
                                )}
                            </button>
                            <div>
                                <h1 className="text-[22px] font-black text-white">
                                    {employee?.firstName} {employee?.lastName}
                                </h1>
                                <p className="text-[14px] text-[#7d93ba]">{formatDateLabel(currentTime)}</p>
                            </div>
                        </div>
                        <span className="text-[22px]">👋</span>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#2d63ea_0%,#4e8cf6_100%)] px-6 py-6 shadow-[0_22px_50px_rgba(47,108,246,0.35)]">
                    <div className="absolute right-5 top-5 flex h-14 w-14 items-center justify-center rounded-[18px] bg-white/12">
                        <FiWifi className="h-7 w-7 text-white" />
                    </div>
                    <p className="text-[12px] font-black uppercase tracking-[0.22em] text-[#bfd2ff]">Today&apos;s Status</p>
                    <div className="mt-3 flex items-center gap-3">
                        <span className={["h-3 w-3 rounded-full", checkedOut || checkedIn ? "bg-[#1de58e]" : "bg-[#f8bf24]"].join(" ")} />
                        <span className="text-[18px] font-black text-white">
                            {checkedOut ? "Checked Out" : checkedIn ? "Checked In" : "Not Checked In"}
                        </span>
                    </div>
                    <div className="mt-7 grid grid-cols-3 gap-4">
                        {[
                            ["Check In", formatTime(todayAttendance?.checkIn)],
                            ["Hours", formatHourMinutes(workedHours)],
                            ["Overtime", formatHourMinutes(overtime)],
                        ].map(([label, value], index) => (
                            <div key={label} className={index < 2 ? "border-r border-white/20 pr-3" : ""}>
                                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#d5e2ff]">{label}</p>
                                <p className="mt-2 text-[18px] font-black text-white">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <ActionButton
                        icon={FiLogIn}
                        label={attendanceAction === "check-in" ? "Checking..." : "Check In"}
                        tone="bg-[#10bf85]"
                        onClick={handleCheckIn}
                        disabled={attendanceAction !== "" || checkedIn}
                    />
                    <ActionButton
                        icon={FiLogOut}
                        label={attendanceAction === "check-out" ? "Saving..." : "Check Out"}
                        tone="bg-[#ff2e3b]"
                        onClick={handleCheckOut}
                        disabled={attendanceAction !== "" || !checkedIn || checkedOut}
                    />
                    <ActionButton
                        icon={FiCalendar}
                        label="Apply Leave"
                        tone="bg-[#f9a20c]"
                        onClick={() => navigate("/leave")}
                    />
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <SummaryCard value={presentDays} label="Present" note="days this month" valueColor="text-[#16e0a0]" tone="border-[#114f4d] bg-[#082f36]" />
                    <SummaryCard value={approvedLeaves} label="Leaves" note="approved requests" valueColor="text-[#ffc400]" tone="border-[#5c4215] bg-[#2b2218]" />
                    <SummaryCard value={formatMoney(latestPayroll?.netSalary)} label="Net Pay" note={formatMonthLabel(latestPayroll?.month, latestPayroll?.year)} valueColor="text-[#4591ff]" tone="border-[#1f4584] bg-[#101f3c]" />
                </div>

                <div>
                    <div className="mb-4 flex items-center justify-between px-1">
                        <p className="text-[13px] font-black uppercase tracking-[0.2em] text-[#93abd4]">Recent Activity</p>
                        <button
                            type="button"
                            onClick={() => navigate("/attendance")}
                            className="flex items-center gap-1 text-[12px] font-bold text-[#4f86ff]"
                        >
                            View all
                            <FiArrowRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {activityItems.map((item) => {
                            const { key, ...props } = item;
                            return <ActivityRow key={key} {...props} />;
                        })}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
