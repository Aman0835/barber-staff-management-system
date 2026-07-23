import { useState, useEffect, useRef } from "react";
import {
    FiBell,
    FiMoon,
    FiSun,
    FiMenu,
    FiX,
    FiHome,
    FiUsers,
    FiCalendar,
    FiClock,
    FiBriefcase,
    FiBarChart2,
    FiScissors,
    FiSettings,
    FiLogOut,
    FiCheckCircle,
    FiInfo,
    FiAlertTriangle
} from "react-icons/fi";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import SearchBar from "../SearchBar/SearchBar";
import * as notificationService from "../../services/notificationService";

const mainNavigation = [
    { to: "/dashboard", label: "Dashboard", icon: FiHome },
    { to: "/employees", label: "Employees", icon: FiUsers },
    { to: "/attendance", label: "Attendance", icon: FiCalendar },
    { to: "/leave", label: "Leave", icon: FiClock },
    { to: "/payroll", label: "Payroll", icon: FiBriefcase },
];

const adminNavigation = [
    { to: "/reports", label: "Reports", icon: FiBarChart2 },
    { to: "/holidays", label: "Holidays", icon: FiScissors },
    { to: "/settings", label: "Settings", icon: FiSettings },
];

export default function Navbar() {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Notifications state
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await notificationService.getAdminNotifications();
            if (res.success) {
                setNotifications(res.data || []);
                setUnreadCount(res.unreadCount || 0);
            }
        } catch (err) {
            console.error("Failed to fetch admin notifications:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll notifications every 30 seconds for live updates
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close notifications dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllNotificationsRead("admin");
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    const handleSingleMarkRead = async (id) => {
        try {
            await notificationService.markNotificationRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark notification read:", err);
        }
    };

    const handleLogout = async () => {
        if (logout) {
            await logout();
        }
        setMobileOpen(false);
    };

    return (
        <>
            <header className="relative z-30 flex items-center justify-between px-4 md:px-8 py-3 bg-white border-b border-slate-200 h-16 shrink-0 dark:bg-slate-900 dark:border-slate-800 gap-3">
                {/* Mobile Menu Hamburger Button */}
                <button
                    type="button"
                    className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition shrink-0"
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open Navigation Menu"
                >
                    <FiMenu className="text-xl" />
                </button>

                {/* Search Input on the Left */}
                <div className="flex-1 max-w-[200px] sm:max-w-xs md:w-72">
                    <SearchBar placeholder="Search employees..." className="w-full" />
                </div>

                {/* Actions & Profile on the Right */}
                <div className="flex items-center gap-3 sm:gap-5 shrink-0 ml-auto">
                    {/* Theme toggle (Moon/Sun icon) */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="p-1.5 text-slate-500 hover:text-slate-700 transition dark:text-slate-400 dark:hover:text-slate-200"
                        title="Toggle Theme"
                    >
                        {theme === "dark" ? <FiSun className="text-lg text-amber-500" /> : <FiMoon className="text-lg" />}
                    </button>

                    {/* Notifications Bell with Dropdown */}
                    <div ref={notifRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setNotifOpen(prev => !prev)}
                            className="relative p-1.5 text-slate-500 hover:text-slate-700 transition dark:text-slate-400 dark:hover:text-slate-200"
                            title="Notifications"
                        >
                            <FiBell className="text-lg" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border border-white dark:border-slate-900">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown Panel */}
                        {notifOpen && (
                            <div className="absolute right-0 top-11 z-50 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                                {/* Dropdown Header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                            Notifications
                                        </h3>
                                        {unreadCount > 0 && (
                                            <span className="rounded-full bg-blue-100 text-blue-600 px-2 py-0.5 text-[10px] font-bold dark:bg-blue-950/50 dark:text-blue-400">
                                                {unreadCount} new
                                            </span>
                                        )}
                                    </div>
                                    {unreadCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleMarkAllRead}
                                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>

                                {/* Notifications List */}
                                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {notifications.length > 0 ? (
                                        notifications.map((n) => (
                                            <div
                                                key={n._id}
                                                onClick={() => !n.read && handleSingleMarkRead(n._id)}
                                                className={`flex items-start gap-3 p-3.5 transition cursor-pointer ${
                                                    !n.read
                                                        ? "bg-blue-50/40 dark:bg-blue-950/20"
                                                        : "hover:bg-slate-50 dark:hover:bg-slate-850"
                                                }`}
                                            >
                                                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                                                    n.type === "leave" ? "bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400" :
                                                    n.type === "attendance" ? "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400" :
                                                    n.type === "holiday" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" :
                                                    "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                                                }`}>
                                                    {n.type === "attendance" ? <FiAlertTriangle /> :
                                                     n.type === "leave" ? <FiClock /> :
                                                     n.type === "holiday" ? <FiCalendar /> : <FiInfo />}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className={`text-xs font-bold truncate ${!n.read ? "text-slate-900 dark:text-slate-50" : "text-slate-700 dark:text-slate-300"}`}>
                                                            {n.title}
                                                        </p>
                                                        {!n.read && (
                                                            <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                                                        {n.message}
                                                    </p>
                                                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">
                                                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                                            No notifications right now.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar Navigation Drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
                        onClick={() => setMobileOpen(false)}
                    />
                    {/* Drawer Content */}
                    <aside className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-slate-900 flex flex-col shadow-2xl z-10">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                            <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                                <img src="/logo.svg" alt="Diva Salon Logo" className="h-9 w-auto dark:invert" />
                            </Link>
                            <button
                                type="button"
                                onClick={() => setMobileOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                                aria-label="Close menu"
                            >
                                <FiX className="text-xl" />
                            </button>
                        </div>

                        {/* Navigation Items */}
                        <div className="flex-1 py-6 px-4 space-y-6 overflow-y-auto">
                            <div>
                                <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                                    Main
                                </p>
                                <nav className="mt-3 space-y-1">
                                    {mainNavigation.map(({ to, label, icon: Icon }) => (
                                        <NavLink
                                            key={to}
                                            to={to}
                                            onClick={() => setMobileOpen(false)}
                                            className={({ isActive }) =>
                                                [
                                                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                                                    isActive
                                                        ? "bg-blue-50 text-blue-600 font-semibold dark:bg-blue-950/40 dark:text-blue-400"
                                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200",
                                                ].join(" ")
                                            }
                                        >
                                            <Icon className="text-lg shrink-0" />
                                            <span>{label}</span>
                                        </NavLink>
                                    ))}
                                </nav>
                            </div>

                            <div>
                                <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                                    Admin
                                </p>
                                <nav className="mt-3 space-y-1">
                                    {adminNavigation.map(({ to, label, icon: Icon }) => (
                                        <NavLink
                                            key={to}
                                            to={to}
                                            onClick={() => setMobileOpen(false)}
                                            className={({ isActive }) =>
                                                [
                                                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                                                    isActive
                                                        ? "bg-blue-50 text-blue-600 font-semibold dark:bg-blue-950/40 dark:text-blue-400"
                                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200",
                                                ].join(" ")
                                            }
                                        >
                                            <Icon className="text-lg shrink-0" />
                                            <span>{label}</span>
                                        </NavLink>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Mobile Drawer Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3 dark:border-slate-800 dark:bg-slate-950/20">
                            <Link
                                to="/profile"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 rounded-xl transition cursor-pointer"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white text-sm">
                                    AR
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                                        Alex Rivera
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                        Super Admin
                                    </p>
                                </div>
                            </Link>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                            >
                                <FiLogOut className="text-base shrink-0" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </>
    );
}
