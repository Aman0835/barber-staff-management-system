import {
    FiBarChart2,
    FiBriefcase,
    FiCalendar,
    FiClock,
    FiHome,
    FiScissors,
    FiSettings,
    FiUsers
} from "react-icons/fi";
import { NavLink, Link } from "react-router-dom";

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

function NavItem({ to, label, icon: Icon }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                [
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                        ? "bg-blue-50 text-blue-600 font-semibold dark:bg-blue-950/40 dark:text-blue-400"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200",
                ].join(" ")
            }
        >
            <Icon className="text-lg shrink-0" />
            <span>{label}</span>
        </NavLink>
    );
}

export default function Sidebar() {
    return (
        <aside className="hidden w-[260px] shrink-0 lg:flex flex-col bg-white border-r border-slate-200 h-full dark:bg-slate-900 dark:border-slate-800">
            {/* Brand Logo */}
            <Link to="/dashboard" className="flex items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800 hover:opacity-90 transition">
                <img src="/logo.svg" alt="Diva Salon Logo" className="h-10 w-auto dark:invert" />
            </Link>

            {/* Navigation Sections */}
            <div className="flex-1 py-6 px-4 space-y-7 overflow-y-auto">
                <div>
                    <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                        Main
                    </p>
                    <nav className="mt-3 space-y-1">
                        {mainNavigation.map((item) => (
                            <NavItem key={item.to} {...item} />
                        ))}
                    </nav>
                </div>

                <div>
                    <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                        Admin
                    </p>
                    <nav className="mt-3 space-y-1">
                        {adminNavigation.map((item) => (
                            <NavItem key={item.to} {...item} />
                        ))}
                    </nav>
                </div>
            </div>

            {/* Sidebar Profile Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3 dark:border-slate-800 dark:bg-slate-950/20">
                <Link
                    to="/profile"
                    className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 rounded-xl transition cursor-pointer"
                >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
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

            </div>
        </aside>
    );
}
