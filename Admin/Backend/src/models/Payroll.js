import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      trim: true
    },
    month: {
      type: Number,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    baseSalary: {
      type: Number,
      default: 0
    },
    overtimeAmount: {
      type: Number,
      default: 0
    },
    deductions: {
      type: Number,
      default: 0
    },
    netSalary: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["draft", "generated", "paid"],
      default: "generated"
    }
  },
  {
    timestamps: true
  }
);

payrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

const Payroll = mongoose.model("Payroll", payrollSchema);

export default Payroll;
