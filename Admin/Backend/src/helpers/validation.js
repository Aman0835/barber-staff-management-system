const validator = require("validator");

function validateSingupData(req) {
  const {
    employeeId,
    firstName,
    lastName,
    phone,
    email,
    role,
    password,
    joiningDate,
    monthlySalary,
    profileImage,
    status,
    gender,
  } = req.body;

  if (!firstName) {
    throw new Error("First name is required");
  }
  if (!lastName) {
    throw new Error("Last name is required");
  }
  if (!employeeId) {
    throw new Error("Employee ID is required");
  }
  if (!phone) {
    throw new Error("Phone number is required");
  }
  if (!validator.isEmail(email)) {
    throw new Error("Invalid email format");
  }
  if (!role) {
    throw new Error("Role is required");
  }
  if (!password) {
    throw new Error("Password is required");
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong enough");
  }
  if (!joiningDate) {
    throw new Error("Joining date is required");
  }
  if (monthlySalary === undefined || monthlySalary === null) {
    throw new Error("Monthly salary is required");
  }
}

function validateuserdata(req) {
  const allowedUpdates = [
    "firstName",
    "lastName",
    "phone",
    "email",
    "role",
    "salary",
    "status",
    "gender",
    "address",
    "photoUrl",
  ];

  const isallowed = Object.keys(req.body).every((fields) =>
    allowedUpdates.includes(fields)
  );

  return isallowed;
}

module.exports = { validateSingupData, validateuserdata };