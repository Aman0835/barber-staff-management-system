import api from "./api";

// Get my attendance records
export const getMyAttendance = async (employeeId) => {
    const response = await api.get(`/employee/attendance/today/${employeeId}`);
    return response.data;
};

// Get today's attendance for me
export const getTodayAttendance = async (employeeId) => {
    const response = await api.get(`/employee/attendance/today/${employeeId}`);
    return response.data;
};

// Check In
export const checkIn = async (employeeId) => {
    const response = await api.post("/employee/attendance/check-in", { employeeId });
    return response.data;
};

// Check Out
export const checkOut = async (employeeId) => {
    const response = await api.post("/employee/attendance/check-out", { employeeId });
    return response.data;
};

// Request Early Checkout
export const requestEarlyCheckout = async (employeeId, reason) => {
    const response = await api.post("/employee/attendance/request-early-checkout", { employeeId, reason });
    return response.data;
};
