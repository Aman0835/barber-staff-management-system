import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiScissors, FiLock, FiUser } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({ emailOrId: "", password: "", rememberMe: false });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.emailOrId.trim() || !form.password.trim()) {
            toast.error("Please enter your credentials");
            return;
        }
        setLoading(true);
        try {
            await login(form.emailOrId.trim(), form.password);
            toast.success("Welcome back!");
            navigate("/dashboard");
        } catch (err) {
            const msg = err?.response?.data?.message ?? "Login failed. Please try again.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[var(--color-app-bg)] dark:bg-[#090a0d]">
            {/* Left — Branding Panel */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                {/* Logo */}
                <div className="flex items-center gap-3.5 relative z-10">
                    <img src="/favicon.svg" alt="Diva Salon Logo" className="h-10 w-10 shrink-0 invert" />
                    <div>
                        <h1 className="text-xl font-light tracking-[0.2em] text-white uppercase leading-none">Diva</h1>
                        <p className="text-[10px] font-medium tracking-[0.25em] text-blue-200 uppercase leading-none mt-1">Salon</p>
                    </div>
                </div>

                {/* Center content */}
                <div className="relative z-10">
                    <h2 className="text-4xl font-extrabold text-white leading-tight">
                        Your work,<br />
                        <span className="text-blue-200">at a glance.</span>
                    </h2>
                    <p className="mt-4 text-blue-200 text-base leading-relaxed max-w-sm">
                        Check your attendance, view your payslips, apply for leave — all in one place.
                    </p>

                    {/* Feature pills */}
                    <div className="mt-8 flex flex-wrap gap-3">
                        {["Attendance Tracking", "Leave Management", "Payroll", "Holiday Calendar"].map((f) => (
                            <span
                                key={f}
                                className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-medium backdrop-blur-sm"
                            >
                                {f}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Bottom tagline */}
                <p className="text-blue-300 text-xs relative z-10">
                    © 2025 Diva The Salon. Employee Portal.
                </p>
            </div>

            {/* Right — Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <img src="/favicon.svg" alt="Diva Salon Logo" className="h-8 w-auto dark:invert" />
                    </div>

                    <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-50 tracking-tight">
                        Sign in
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Enter your Employee ID or email to continue
                    </p>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        {/* Email / Employee ID */}
                        <div>
                            <label
                                htmlFor="login-emailOrId"
                                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                            >
                                Employee ID or Email
                            </label>
                            <div className="relative">
                                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                <input
                                    id="login-emailOrId"
                                    type="text"
                                    name="emailOrId"
                                    value={form.emailOrId}
                                    onChange={handleChange}
                                    placeholder="EMP001 or john@diva.com"
                                    autoComplete="username"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label
                                    htmlFor="login-password"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Password
                                </label>
                                <button
                                    type="button"
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium dark:text-blue-400"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                                id="login-remember"
                                type="checkbox"
                                name="rememberMe"
                                checked={form.rememberMe}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
                        </label>

                        {/* Submit */}
                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                        >
                            {loading ? (
                                <>
                                    <div
                                        style={{
                                            width: 18,
                                            height: 18,
                                            borderRadius: "50%",
                                            border: "2px solid rgba(255,255,255,0.3)",
                                            borderTopColor: "#fff",
                                            animation: "spin 0.7s linear infinite",
                                        }}
                                    />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
                        Having trouble logging in? Contact your administrator.
                    </p>
                </div>
            </div>
        </div>
    );
}
