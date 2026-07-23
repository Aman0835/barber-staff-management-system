import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiEye, // Added FiEye
  FiEyeOff, // Added FiEyeOff
  FiImage,
  FiLink,
  FiMail,
  FiMapPin,
  FiPhone,
  FiPlus,
  FiTrash2,
  FiUpload,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";
import SearchBar from "../../components/SearchBar/SearchBar";
import * as employeeService from "../../services/employeeService";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "on_leave", label: "On Leave" },
];

export default function Employees() {
  // Roster lists
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalEmployees, setTotalEmployees] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const navigate = useNavigate();

  // Pagination & Filter
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [formMode, setFormMode] = useState("create"); // "create" | "edit"

  // Form inputs state
  const [employeeId, setEmployeeId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("male");
  const [role, setRole] = useState("employee");
  const [password, setPassword] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [monthlySalary, setMonthlySalary] = useState(0);
  const [profileImage, setProfileImage] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("active");

  const [showPassword, setShowPassword] = useState(false); // New state for password visibility

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Load roster data
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 100,
        search,
        status: statusFilter || undefined,
      };
      const res = await employeeService.getEmployees(params);
      if (res.success) {
        setEmployees(res.data);
        setTotalPages(res.totalPages);
        setTotalEmployees(res.totalEmployees);
      }
    } catch (err) {
      console.error("Fetch roster error:", err);
      toast.error("Failed to load employee roster");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, statusFilter, search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(e.target)
      ) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClearFilters = () => {
    setStatusFilter("");
    setSearchParams({});
    setPage(1);
  };

  const handleOpenCreate = () => {
    setFormMode("create");
    setEmployeeId("EMP-" + Math.floor(1000 + Math.random() * 9000));
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setGender("male");
    setRole("employee");
    setPassword("Pass1234!");
    setJoiningDate(new Date().toISOString().split("T")[0]);
    setMonthlySalary(3000);
    setProfileImage(
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&q=80&w=200",
    );
    setAddress("");
    setStatus("active");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setFormMode("edit");
    setSelectedEmp(emp);
    setEmployeeId(emp.employeeId);
    setFirstName(emp.firstName);
    setLastName(emp.lastName);
    setEmail(emp.email);
    let p = emp.phone || "";
    if (p.startsWith("+91")) p = p.substring(3);
    setPhone(p);
    setGender(emp.gender || "male");
    setRole(emp.role);
    setPassword(""); // don't set password when editing
    setJoiningDate(emp.joiningDate ? emp.joiningDate.split("T")[0] : "");
    setMonthlySalary(emp.monthlySalary || 0);
    setProfileImage(emp.profileImage || "");
    setAddress(emp.address || "");
    setStatus(emp.status || "active");
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?"))
      return;
    try {
      const res = await employeeService.deleteEmployee(id);
      if (res.success) {
        toast.success("Employee removed successfully");
        fetchEmployees();
      }
    } catch (err) {
      toast.error("Failed to remove employee");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      employeeId,
      firstName,
      lastName,
      email,
      phone: phone.startsWith("+91") ? phone : `+91${phone}`,
      gender,
      role,
      joiningDate,
      monthlySalary: Number(monthlySalary),
      profileImage,
      address,
      status,
    };

    if (formMode === "create") {
      payload.password = password;
    }

    try {
      let res;
      if (formMode === "create") {
        res = await employeeService.createEmployee(payload);
      } else {
        res = await employeeService.updateEmployee(selectedEmp._id, payload);
      }

      if (res.success) {
        if (
          formMode === "create" &&
          res.credentials?.employeeId &&
          res.credentials?.password
        ) {
          toast.success(
            `Employee created successfully! ID: ${res.credentials.employeeId} Password: ${res.credentials.password}`,
            { duration: 8000 },
          );
        } else {
          toast.success(
            res.message ||
              `Employee ${formMode === "create" ? "created" : "updated"} successfully!`,
          );
        }
        setIsFormOpen(false);
        fetchEmployees();
      }
    } catch (err) {
      console.error("Form submit error:", err);
      toast.error(
        err.response?.data?.message || "Failed to submit employee form",
      );
    }
  };

  return (
    <DashboardLayout
      title="Employees"
      subtitle="Manage your barber staff profile files, contacts, schedules, and payroll parameters."
      action={
        <button
          onClick={handleOpenCreate}
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-700 shadow-sm">
          <FiPlus /> Add Employee
        </button>
      }>
      {/* Filters panel */}
      <section className="mt-2 rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] dark:border-slate-800/80 dark:bg-slate-900/20 text-slate-800 dark:text-slate-100">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-black text-slate-855 dark:text-slate-200">
              Staff Directory
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Search and filter standard barber files ·{" "}
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {totalEmployees} total
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row items-stretch sm:items-center">
            {/* Search field */}
            <SearchBar
              placeholder="Search by name, ID..."
              className="w-full sm:w-64"
            />

            {/* Status Filter Dropdown */}
            <div
              ref={statusDropdownRef}
              className="relative w-full sm:w-44 select-none">
              <button
                type="button"
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className="flex h-9 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 pl-3.5 pr-3 text-xs font-bold text-slate-600 outline-none transition-all hover:bg-slate-100/50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350 cursor-pointer">
                <span>
                  {statusOptions.find((o) => o.value === statusFilter)?.label ||
                    "All Statuses"}
                </span>
                <FiChevronDown
                  className={`text-xs text-slate-400 transition-transform duration-200 ${statusDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {statusDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 left-0 mt-2.5 z-40 overflow-hidden rounded-2xl border border-slate-150 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    <div className="py-1.5">
                      {statusOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setStatusFilter(opt.value);
                            setPage(1);
                            setStatusDropdownOpen(false);
                          }}
                          className={`flex w-full items-center px-4 py-2.5 text-left text-xs transition-all hover:bg-blue-50 dark:hover:bg-slate-800/60 font-semibold ${
                            statusFilter === opt.value
                              ? "text-blue-600 bg-blue-50/30 dark:text-blue-450 dark:bg-blue-950/10"
                              : "text-slate-600 dark:text-slate-400"
                          }`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Roster Cards Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        </div>
      ) : (
        <>
          {employees.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center text-center py-16 px-4 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/10 shadow-[0_8px_30px_rgb(0,0,0,0.005)]">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 mb-4 shadow-inner">
                <div className="absolute inset-0 rounded-2xl bg-blue-500/5 blur-md animate-pulse"></div>
                <FiUsers className="text-2xl relative" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-305">
                No Employees Found
              </h3>
              <p className="mt-1.5 max-w-[320px] text-xs text-slate-400 dark:text-slate-550 leading-normal">
                {search || statusFilter
                  ? `No staff files match the search "${search || ""}" or selected status filter.`
                  : "There are currently no staff files registered in the system."}
              </p>
              {(search || statusFilter) && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 inline-flex h-8.5 items-center gap-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-all font-bold px-4.5 text-[10px] uppercase tracking-wider dark:bg-blue-955/20 dark:text-blue-400 dark:border-blue-900/30 cursor-pointer">
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <section className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {employees.map((barber) => (
                <article
                  key={barber._id}
                  className="panel-surface rounded-[24px] p-5 shadow-sm flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-800 transition-colors text-slate-800 dark:text-slate-100">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className="flex items-center gap-3.5 cursor-pointer"
                        onClick={() => navigate(`/employees/${barber._id}`)}>
                        {barber.profileImage ? (
                          <img
                            src={barber.profileImage}
                            alt={barber.firstName}
                            loading="lazy"
                            className="h-14 w-14 rounded-2xl object-cover border border-slate-100 dark:border-slate-800"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-base font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                            {barber.firstName[0]}
                            {barber.lastName[0]}
                          </div>
                        )}

                        <div>
                          <h3 className="text-sm font-bold text-slate-805 dark:text-slate-105 hover:text-blue-600 transition">
                            {barber.firstName} {barber.lastName}
                          </h3>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                            {barber.role}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(barber)}
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 transition"
                          title="Edit Profile">
                          <FiEdit2 className="text-xs" />
                        </button>
                        <button
                          onClick={() => handleDelete(barber._id)}
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 dark:border-red-950 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 transition"
                          title="Delete Employee">
                          <FiTrash2 className="text-xs" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-950/20 p-2.5 border border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase block tracking-wider font-semibold">
                          Wage scale
                        </span>
                        <span className="font-bold block mt-1 text-slate-800 dark:text-slate-200">
                          ${barber.monthlySalary?.toLocaleString()}/mo
                        </span>
                      </div>
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-950/20 p-2.5 border border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase block tracking-wider font-semibold">
                          Status
                        </span>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase mt-1 ${
                            barber.status === "active"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900"
                              : barber.status === "on_leave"
                                ? "bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900"
                                : "bg-slate-100 text-slate-550 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                          }`}>
                          {barber.status || "active"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                      <div className="flex items-center gap-2">
                        <FiMail className="text-blue-500 shrink-0" />
                        <span className="truncate">{barber.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiPhone className="text-blue-500 shrink-0" />
                        <span>{barber.phone}</span>
                      </div>
                      {barber.address && (
                        <div className="flex items-center gap-2">
                          <FiMapPin className="text-blue-500 shrink-0" />
                          <span className="truncate">{barber.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/employees/${barber._id}`)}
                    className="mt-5 w-full text-xs font-semibold text-blue-600 bg-blue-50/50 py-2 rounded-xl border border-blue-100 hover:bg-blue-50 hover:text-blue-700 transition dark:bg-blue-950/20 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950/40">
                    View Full Workfile
                  </button>
                </article>
              ))}
            </section>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6 text-xs text-slate-500">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800/60 disabled:opacity-50">
                <FiChevronLeft /> Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800/60 disabled:opacity-50">
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}

      {/* FORM MODAL: Create / Edit Employee */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-[600px] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl overflow-y-auto no-scrollbar max-h-[90vh] text-slate-800 dark:text-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-slate-850 dark:text-slate-100">
                  {formMode === "create"
                    ? "Add New Employee"
                    : "Edit Employee Profile"}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-slate-200">
                  <FiX />
                </button>
              </div>

              <form
                onSubmit={handleFormSubmit}
                className="mt-5 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Marcus"
                      className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-150"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Rivera"
                      className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-150"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                      Employee ID (Auto-generated)
                    </label>
                    <input
                      type="text"
                      required
                      value={employeeId}
                      readOnly
                      className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-100 dark:bg-slate-800/40 px-3 text-xs outline-none text-slate-500 cursor-not-allowed dark:border-slate-800 dark:text-slate-450"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="marcus@clipper.co"
                      className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-150"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                      Phone Number
                    </label>
                    <div className="relative mt-1.5 flex items-center">
                      <span className="absolute left-3.5 text-xs font-bold text-slate-450 dark:text-slate-500 select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={(e) =>
                          setPhone(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="98765 43210"
                        className="w-full h-10 pl-11 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-150"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-150">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                      Role / Designation
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-150">
                      <option value="employee">Barber / Stylist</option>
                      <option value="manager">Shop Manager</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                      Monthly Base Salary (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={monthlySalary}
                      onChange={(e) => setMonthlySalary(e.target.value)}
                      placeholder="25000"
                      className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-150"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                    Employee Login Password
                  </label>
                  <input
                    type="text"
                    required={formMode === "create"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={formMode === "create" ? "Set password for employee login" : "Enter new password to reset..."}
                    className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-150"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                      Joining Date
                    </label>
                    <input
                      type="date"
                      required
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-150"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-150">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="on_leave">On Leave</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                    Profile Picture
                  </label>
                  <div className="mt-1.5 flex items-center gap-3.5 bg-slate-50 dark:bg-slate-800/20 p-3 rounded-2xl border border-slate-150 dark:border-slate-800">
                    {/* Preview Area */}
                    <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800 flex items-center justify-center">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Avatar Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FiImage className="text-xl text-slate-400 dark:text-slate-600" />
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <label className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-all font-bold px-3 text-[10px] uppercase tracking-wider dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30 cursor-pointer">
                          <FiUpload className="text-xs" /> Upload Photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setProfileImage(reader.result);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>

                        {profileImage && (
                          <button
                            type="button"
                            onClick={() => setProfileImage("")}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all font-bold px-3 text-[10px] uppercase tracking-wider dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30 cursor-pointer">
                            Clear
                          </button>
                        )}
                      </div>

                      <div className="relative flex items-center">
                        <div className="absolute left-2.5 text-slate-400 dark:text-slate-600">
                          <FiLink className="text-[10px]" />
                        </div>
                        <input
                          type="text"
                          value={
                            profileImage && profileImage.startsWith("data:")
                              ? ""
                              : profileImage
                          }
                          onChange={(e) => setProfileImage(e.target.value)}
                          placeholder="Or paste external image URL..."
                          className="w-full h-8 pl-7.5 pr-2.5 rounded-lg border border-slate-200 bg-white text-[10px] outline-none focus:border-blue-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-150"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                    Home Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Downtown Chair 01, Barber Shop lounge"
                    className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-150"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 mt-6 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-sm">
                  {formMode === "create"
                    ? "Add to Directory"
                    : "Update Profile"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
