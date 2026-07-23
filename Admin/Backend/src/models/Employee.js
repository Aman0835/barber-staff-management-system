import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import validator from "validator";

dotenv.config();

const JWT_SECRET = (process.env.JWT_SECRET || "secretkey").trim();

const generateEmployeeId = () => `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },

    gender: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
      enum: ["male", "female", "other"],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isMobilePhone(value, "any")) {
          throw new Error("Invalid phone number");
        }
      },
    },

    role: {
      type: String,
      required: true,
      trim: true,
      enum: ["admin", "manager", "employee"],
      default: "employee",
    },

    password: {
      type: String,
      required: true,
    },

    visiblePassword: {
      type: String,
      default: "Pass1234!",
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },

    monthlySalary: {
      type: Number,
      default: 0,
      min: 0,
    },

    profileImage: {
      type: String,
      default: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.M2B4Q0iKZaV9vrcrbzLbVgHaHa%3Fr%3D0%26pid%3DApi&f=1&ipt=3d0c93a2eb5e001259e2c1b02a0971ed7122e60c002edf9057268433569d5cd4",
      validate(value) {
        if (value && !value.startsWith("data:image/") && !validator.isURL(value)) {
          throw new Error("Invalid image URL");
        }
      },
    },

    address: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "on_leave"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

employeeSchema.index({
  employeeId: 1,
  email: 1,
});

employeeSchema.pre("validate", function (next) {
  if (!this.employeeId || !this.employeeId.trim()) {
    this.employeeId = generateEmployeeId();
  }
  next();
});

employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

employeeSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (!update || !update.password) return next();
  update.password = await bcrypt.hash(update.password, 12);
  next();
});

employeeSchema.methods.getJWT = async function () {
  const employee = this;

  const token = await jwt.sign({ _id: employee._id }, JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

employeeSchema.methods.validatePassword = async function (passwordByUser) {
  const employee = this;
  const hashedPassword = employee.password;
  return await bcrypt.compare(passwordByUser, hashedPassword);
};

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;

