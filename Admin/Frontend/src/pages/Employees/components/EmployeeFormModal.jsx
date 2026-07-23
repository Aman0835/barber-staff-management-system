import React, { useState } from "react";
import { FiX, FiUpload, FiLink, FiImage, FiEye, FiEyeOff } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

export default function EmployeeFormModal({
    isOpen, onClose, formMode, onSubmit,
    employeeId, firstName, setFirstName, lastName, setLastName,
    email, setEmail, phone, setPhone, gender, setGender,
    role, setRole, password, setPassword, joiningDate, setJoiningDate,
    monthlySalary, setMonthlySalary, profileImage, setProfileImage,
    address, setAddress, status, setStatus,
}) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white dark:bg-slate-900 w-full max-w-[600px] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl overflow-y-auto no-scrollbar max-h-[90vh] text-slate-800 dark:text-slate-100"
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h3 className="text-xl font-bold text-slate-850 dark:text-slate-100">
                                {formMode === "create" ? "Add New Employee" : "Edit Employee Profile"}
                            </h3>
                            <button onClick={onClose}
                                className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-slate-200">
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={onSubmit} autoComplete="off" className="mt-5 space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">First Name</label>
                                    <input type="text" required autoComplete="off" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Marcus"
                                        className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-150" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Last Name</label>
                                    <input type="text" required autoComplete="off" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Rivera"
                                        className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-150" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Employee ID (Auto-generated)</label>
                                    <input type="text" required value={employeeId} readOnly
                                        className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-100 dark:bg-slate-800/40 px-3 text-xs outline-none text-slate-500 cursor-not-allowed dark:border-slate-800 dark:text-slate-450" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Email Address</label>
                                    <input type="email" required autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="marcus@clipper.co"
                                        className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-150" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Phone Number</label>
                                    <div className="relative mt-1.5 flex items-center">
                                        <span className="absolute left-3.5 text-xs font-bold text-slate-455 dark:text-slate-500 select-none">+91</span>
                                        <input type="tel" required autoComplete="off" maxLength={10} value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="98765 43210"
                                            className="w-full h-10 pl-11 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-150" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Gender</label>
                                    <select value={gender} onChange={(e) => setGender(e.target.value)}
                                        className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-150">
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Role / Designation</label>
                                    <select value={role} onChange={(e) => setRole(e.target.value)}
                                        className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-150">
                                        <option value="employee">Barber / Stylist</option>
                                        <option value="manager">Shop Manager</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Monthly Base Salary (₹)</label>
                                    <input type="number" required value={monthlySalary} onChange={(e) => setMonthlySalary(e.target.value)} placeholder="25000"
                                        className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-150" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Employee Login Password</label>
                                <div className="relative mt-1.5">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required={formMode === "create"}
                                        autoComplete="new-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={formMode === "create" ? "Set password for employee login" : "Leave blank or enter new password..."}
                                        className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 pr-11 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-150 placeholder:text-slate-350 dark:placeholder:text-slate-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 transition hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Joining Date</label>
                                    <input type="date" required value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)}
                                        className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-150" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Status</label>
                                    <select value={status} onChange={(e) => setStatus(e.target.value)}
                                        className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-150">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="on_leave">On Leave</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Profile Picture</label>
                                <div className="mt-1.5 flex items-center gap-3.5 bg-slate-50 dark:bg-slate-800/20 p-3 rounded-2xl border border-slate-150 dark:border-slate-800">
                                    <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800 flex items-center justify-center">
                                        {profileImage ? (
                                            <img src={profileImage} alt="Avatar Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <FiImage className="text-xl text-slate-400 dark:text-slate-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                            <label className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-all font-bold px-3 text-[10px] uppercase tracking-wider dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30 cursor-pointer">
                                                <FiUpload className="text-xs" /> Upload Photo
                                                <input type="file" accept="image/*" onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => setProfileImage(reader.result);
                                                        reader.readAsDataURL(file);
                                                    }
                                                }} className="hidden" />
                                            </label>
                                            {profileImage && (
                                                <button type="button" onClick={() => setProfileImage("")}
                                                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all font-bold px-3 text-[10px] uppercase tracking-wider dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30 cursor-pointer">
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative flex items-center">
                                            <div className="absolute left-2.5 text-slate-400 dark:text-slate-600"><FiLink className="text-[10px]" /></div>
                                            <input type="text"
                                                value={profileImage && profileImage.startsWith("data:") ? "" : profileImage}
                                                onChange={(e) => setProfileImage(e.target.value)}
                                                placeholder="Or paste external image URL..."
                                                className="w-full h-8 pl-7.5 pr-2.5 rounded-lg border border-slate-200 bg-white text-[10px] outline-none focus:border-blue-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-150" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Home Address</label>
                                <input type="text" autoComplete="off" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Downtown Chair 01, Barber Shop lounge"
                                    className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-855 dark:text-slate-150" />
                            </div>

                            <button type="submit" className="w-full h-11 mt-6 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-sm">
                                {formMode === "create" ? "Add to Directory" : "Update Profile"}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
