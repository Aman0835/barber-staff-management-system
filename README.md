# CRM Admin 

A production-ready **Employee Management & Payroll System** built specifically for barber shops and salons. The platform enables employees to manage their daily attendance, leave requests, and salary information through a mobile application, while administrators can efficiently manage employees, monitor attendance, approve leave requests, and generate monthly payroll from a centralized dashboard.

Prototype link :- https://vivid-custom-72137772.figma.site/
---

## 📌 Overview

Managing employee attendance and payroll manually is time-consuming and error-prone. This system digitizes the complete employee workflow by providing:

* Employee Mobile Application
* Admin Web Dashboard
* Attendance Tracking
* Leave Management
* Automated Payroll Calculation
* Employee Records Management
* Reports & Analytics

---

## ✨ Features

### 👨‍💼 Employee App

* Secure Login
* Check In
* Check Out
* Attendance History
* Monthly Attendance Summary
* Apply Leave
* View Leave Status
* View Monthly Salary
* Profile Management
* Change Password

---

### 👑 Admin Dashboard

* Dashboard Analytics
* Employee Management (CRUD)
* Attendance Monitoring
* Leave Approval / Rejection
* Payroll Generation
* Salary Management
* Reports
* Holiday Management
* System Settings

---

## 🏗️ System Architecture

```text
Employee Mobile App
        │
        ▼
REST API (Node.js + Express)
        │
        ├── Authentication
        ├── Employee Service
        ├── Attendance Service
        ├── Leave Service
        ├── Payroll Service
        ├── Reports Service
        │
        ▼
MongoDB
        ▲
        │
Admin Dashboard
```

---

## 🛠️ Tech Stack

### Mobile Application

* React Native
* Expo
* React Navigation
* Axios
* Redux Toolkit

### Admin Dashboard

* React
* Vite
* Tailwind CSS
* Shadcn UI
* React Router
* React Query

### Backend

* Node.js
* Express.js
* JWT Authentication
* bcrypt
* Multer

### Database

* MongoDB
* Mongoose

### Deployment

* Vercel (Frontend)
* Railway / Render (Backend)
* MongoDB Atlas

---

## 📁 Project Structure

```text
barber-staff-management-system
│
├── mobile-app/
│
├── admin-dashboard/
│
├── backend/
│
├── docs/
│
├── database/
│
├── assets/
│
└── README.md
```

---

## 📊 Core Modules

### Authentication

* Login
* Logout
* JWT Authentication
* Role-Based Authorization

### Employee Management

* Create Employee
* Update Employee
* Delete Employee
* Employee Profile

### Attendance

* Daily Check In
* Daily Check Out
* Working Hours Calculation
* Monthly Attendance

### Leave Management

* Apply Leave
* Approve Leave
* Reject Leave
* Leave History

### Payroll

* Automatic Salary Calculation
* Working Days
* Leave Days
* Deductions
* Bonus
* Final Salary

### Reports

* Attendance Report
* Payroll Report
* Employee Report
* Leave Report

---

## 🗄️ Database Collections

* users
* employees
* attendance
* leave_requests
* payrolls
* holidays
* settings
* notifications
* audit_logs

---

## 🔐 User Roles

### Employee

* Login
* Check In
* Check Out
* Apply Leave
* View Attendance
* View Salary
* Update Profile

### Admin

* Manage Employees
* Manage Attendance
* Approve Leaves
* Generate Payroll
* View Reports
* Manage Holidays
* Update Settings

---

## 🚀 API Modules

* Authentication
* Employee
* Attendance
* Leave
* Payroll
* Dashboard
* Reports
* Notifications
* Holidays
* Settings

---

## 💼 Future Enhancements

* GPS-Based Attendance
* QR Code Check-In
* Face Recognition Attendance
* Push Notifications
* Multi-Branch Support
* Multi-Shop Support
* Performance Tracking
* Shift Scheduling
* Cloud Backups
* AI Payroll Insights

---

## 🎯 Project Goals

* Reduce manual attendance tracking
* Automate salary calculations
* Improve employee management
* Provide real-time attendance monitoring
* Simplify leave approval workflow
* Generate accurate monthly payroll

---

## 👨‍💻 Author

**Aman Vishwakarma**

Full Stack Developer

---

## 📄 License

This project is intended for educational purposes and commercial client implementation.
