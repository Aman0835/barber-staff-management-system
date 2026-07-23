import bcrypt from "bcrypt";
import Employee from "../models/Employee.js";

const generateEmployeeId = () => `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

// Get All Employees

export const getEmployees = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
    } = req.query;

    const query = {};

    if (search) {
      const words = search.trim().split(/\s+/);
      if (words.length === 1) {
        query.$or = [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { employeeId: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      } else {
        
        query.$and = words.map((word) => ({
          $or: [
            { firstName: { $regex: word, $options: "i" } },
            { lastName: { $regex: word, $options: "i" } },
          ],
        }));
      }
    }

    if (status) {
      query.status = status;
    }

    const employees = await Employee.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const totalEmployees = await Employee.countDocuments(query);

    res.status(200).json({
      success: true,
      totalEmployees,
      page: Number(page),
      totalPages: Math.ceil(totalEmployees / limit),
      data: employees,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Update Employee Status
export const updateEmployeeStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee status updated successfully",
      data: employee,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



//get employee by id
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Create Employee

export const createEmployee = async (req, res) => {
  try {
    const rawPassword = typeof req.body.password === "string" ? req.body.password.trim() : "";
    const finalPassword = rawPassword || "Pass1234!";
    const finalEmployeeId = (req.body.employeeId || "").trim() || generateEmployeeId();

    const employeeData = {
      ...req.body,
      employeeId: finalEmployeeId,
      password: finalPassword,
      visiblePassword: finalPassword,
    };

    const employee = await Employee.create(employeeData);
    const employeeResponse = employee.toObject();

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employeeResponse,
      credentials: {
        employeeId: employeeResponse.employeeId,
        password: finalPassword,
      },
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Update Employee
// ======================================
export const updateEmployee = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.password && typeof updates.password === "string" && updates.password.trim()) {
      const plainPassword = updates.password.trim();
      updates.visiblePassword = plainPassword;
      updates.password = await bcrypt.hash(plainPassword, 12);
    } else {
      delete updates.password;
      delete updates.visiblePassword;
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Delete Employee
// ======================================
export const deleteEmployee = async (req, res) => {
  try {

    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};