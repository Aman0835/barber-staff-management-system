import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js";

export const employeeAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            res.status(401).send("pls login!!");
        }

        const decoded = await jwt.verify(token, "secretkey");

        const { _id } = decoded;

        const employee = await Employee.findOne({ _id });
        if (!employee) {
            throw new Error(" Unauthorized : employee not found");
        }
        req.employee = employee;
        next();
    } catch (error) {
        res.status(401).send(" something went wrong : " + error.message);
    }
};