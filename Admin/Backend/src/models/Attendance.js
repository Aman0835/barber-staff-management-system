import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: String,
      required: true
    },
    checkIn: {
      type: String,
      default: ""
    },
    checkOut: {
      type: String,
      default: ""
    },
    workingHours: {
      type: Number,
      default: 0
    },
    overtime: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Half Day", "Leave"],
      default: "Present"
    }
  },
  {
    timestamps: true
  }
);

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
