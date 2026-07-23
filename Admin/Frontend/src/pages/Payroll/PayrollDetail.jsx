import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    FiArrowLeft, FiDownload, FiPrinter 
} from "react-icons/fi";
import html2pdf from "html2pdf.js";
import toast from "react-hot-toast";

import DashboardLayout from "../../components/layout/DashboardLayout";
import * as payrollService from "../../services/payrollService";
import * as employeeService from "../../services/employeeService";

// Helper for formatting date
const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
};

export default function PayrollDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [payroll, setPayroll] = useState(null);
    const [employee, setEmployee] = useState(null);

    const fetchDetailData = async () => {
        setLoading(true);
        try {
            const payRes = await payrollService.getPayrollById(id);
            if (payRes.success && payRes.data) {
                setPayroll(payRes.data);
                const empRes = await employeeService.getEmployees({ limit: 100 });
                if (empRes.success) {
                    const emp = empRes.data.find(e => e.employeeId === payRes.data.employeeId);
                    if (emp) {
                        setEmployee(emp);
                    } else {
                        toast.error("Employee profile not found");
                    }
                }
            } else {
                toast.error("Payroll record not found");
                navigate("/payroll");
            }
        } catch (err) {
            console.error("Payroll details error:", err);
            toast.error("Failed to load payroll details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetailData();
    }, [id]);

    if (loading) {
        return (
            <DashboardLayout title="Payroll Details">
                <div className="flex h-64 items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!payroll || !employee) return null;

    // Derived variables for professional payslip tables
    const basicPay = Math.round(payroll.baseSalary * 0.6);
    const hra = Math.round(payroll.baseSalary * 0.2);
    const medical = Math.round(payroll.baseSalary * 0.08);
    const travel = Math.round(payroll.baseSalary * 0.07);
    const otherAllow = payroll.baseSalary - (basicPay + hra + medical + travel);
    const totalEarnings = payroll.baseSalary + payroll.overtimeAmount;

    const pf = Math.round(basicPay * 0.12);
    const pt = 20;
    const leaveDeduction = Math.min(payroll.deductions, Math.max(0, payroll.deductions - pf - pt));
    const otherDeduction = payroll.deductions - (pf + pt + leaveDeduction);

    const handlePrintOrPDF = () => {
        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "none";
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`
            <html>
                <head>
                    <title>Payslip - ${employee.firstName} ${employee.lastName}</title>
                    <style>
                        @page { size: A4; margin: 0; }
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                            margin: 0;
                            padding: 50px;
                            color: #334155;
                            background-color: #ffffff;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .invoice-card { background: #ffffff; max-width: 800px; margin: 0 auto; }
                        .header-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                        .logo-title { font-size: 26px; font-weight: 900; color: #1e3a8a; letter-spacing: -0.02em; }
                        .logo-subtitle { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 2px; }
                        .invoice-label { text-align: right; vertical-align: top; }
                        .invoice-label h1 { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; }
                        .invoice-label p { font-size: 11px; color: #64748b; margin: 5px 0 0 0; }
                        .info-grid { width: 100%; border-collapse: collapse; margin-bottom: 35px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
                        .info-grid td { padding: 16px 20px; width: 25%; vertical-align: top; }
                        .info-grid td:not(:last-child) { border-right: 1px solid #e2e8f0; }
                        .info-label { font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 4px; }
                        .info-value { font-size: 12px; font-weight: 700; color: #1e293b; }
                        .cols-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                        .cols-table td { width: 50%; vertical-align: top; }
                        .cols-table td:first-child { padding-right: 20px; }
                        .cols-table td:last-child { padding-left: 20px; border-left: 1px solid #e2e8f0; }
                        .breakdown-title { font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 12px; }
                        .item-table { width: 100%; border-collapse: collapse; }
                        .item-table th, .item-table td { padding: 10px 0; font-size: 12px; text-align: left; }
                        .item-table th { font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0; }
                        .item-table td { color: #334155; border-bottom: 1px solid #f1f5f9; }
                        .item-table td.val { text-align: right; font-weight: 600; }
                        .item-table td.val.plus { color: #16a34a; }
                        .item-table td.val.minus { color: #dc2626; }
                        .summary-box { float: right; width: 320px; background-color: #f1f5f9; border-radius: 12px; padding: 16px; margin-top: 10px; }
                        .summary-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px; }
                        .summary-row.total { font-size: 15px; font-weight: 800; color: #1e3a8a; border-top: 1.5px solid #cbd5e1; padding-top: 8px; margin-bottom: 0; }
                        .clear-float { clear: both; }
                        .signature-section { margin-top: 80px; width: 100%; border-collapse: collapse; }
                        .signature-section td { width: 50%; text-align: center; font-size: 11px; color: #64748b; }
                        .signature-line { width: 200px; border-bottom: 1px solid #94a3b8; margin: 0 auto 8px auto; }
                        .footer { margin-top: 100px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 10px; color: #94a3b8; }
                    </style>
                </head>
                <body>
                    <div class="invoice-card">
                        <table class="header-table">
                            <tr>
                                <td>
                                    <div class="logo-title">Diva</div>
                                    <div class="logo-subtitle">The Salon</div>
                                </td>
                                <td class="invoice-label">
                                    <h1>Salary Statement</h1>
                                    <p>Period: Month ${payroll.month} / ${payroll.year}</p>
                                </td>
                            </tr>
                        </table>

                        <table class="info-grid">
                            <tr>
                                <td>
                                    <span class="info-label">Employee Name</span>
                                    <span class="info-value">${employee.firstName} ${employee.lastName}</span>
                                </td>
                                <td>
                                    <span class="info-label">Employee ID</span>
                                    <span class="info-value">${payroll.employeeId}</span>
                                </td>
                                <td>
                                    <span class="info-label">Designation</span>
                                    <span class="info-value" style="text-transform: capitalize;">${employee.role}</span>
                                </td>
                                <td>
                                    <span class="info-label">Statement Date</span>
                                    <span class="info-value">${new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                </td>
                            </tr>
                        </table>

                        <table class="cols-table">
                            <tr>
                                <td>
                                    <div class="breakdown-title">Earnings</div>
                                    <table class="item-table">
                                        <thead>
                                            <tr>
                                                <th>Description</th>
                                                <th style="text-align: right;">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Basic Salary</td>
                                                <td class="val">₹${basicPay.toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td>HRA (House Rent Allowance)</td>
                                                <td class="val">₹${hra.toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td>Medical Allowance</td>
                                                <td class="val">₹${medical.toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td>Travel Allowance</td>
                                                <td class="val">₹${travel.toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td>Overtime Allowance</td>
                                                <td class="val plus">+₹${payroll.overtimeAmount.toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td>Other Allowance</td>
                                                <td class="val">₹${otherAllow.toLocaleString()}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                                <td>
                                    <div class="breakdown-title">Deductions</div>
                                    <table class="item-table">
                                        <thead>
                                            <tr>
                                                <th>Description</th>
                                                <th style="text-align: right;">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Provident Fund</td>
                                                <td class="val minus">-₹${pf.toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td>Professional Tax</td>
                                                <td class="val minus">-₹${pt.toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td>Leave Deduction</td>
                                                <td class="val minus">-₹${leaveDeduction.toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td>Other Deductions</td>
                                                <td class="val minus">-₹${otherDeduction.toLocaleString()}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </table>

                        <div class="summary-box">
                            <div class="summary-row">
                                <span>Gross Earnings:</span>
                                <strong>₹${totalEarnings.toLocaleString()}</strong>
                            </div>
                            <div class="summary-row">
                                <span>Total Deductions:</span>
                                <strong style="color: #dc2626;">-₹${payroll.deductions.toLocaleString()}</strong>
                            </div>
                            <div class="summary-row total">
                                <span>Net Paid Amount:</span>
                                <span>₹${payroll.netSalary.toLocaleString()}</span>
                            </div>
                        </div>
                        <div class="clear-float"></div>

                        <table class="signature-section">
                            <tr>
                                <td>
                                    <div class="signature-line"></div>
                                    <span>Employee Signature</span>
                                </td>
                                <td>
                                    <div class="signature-line"></div>
                                    <span>Authorized Signatory</span>
                                </td>
                            </tr>
                        </table>

                        <div class="footer">
                            This is a computer generated salary slip.
                        </div>
                    </div>
                </body>
            </html>
        `);
        doc.close();

        iframe.contentWindow.focus();
        iframe.contentWindow.print();

        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
    };

    const handleDownloadPDF = () => {
        const exporter = typeof html2pdf === "function" ? html2pdf : (html2pdf && html2pdf.default);
        if (!exporter) {
            toast.error("PDF engine is not initialized");
            return;
        }

        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.top = "-9999px";
        container.innerHTML = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #334155; background-color: #ffffff; width: 720px; font-size: 12px; line-height: 1.5;">
                <div style="display: flex; justify-content: space-between; align-items: start; border-bottom: 2px solid #cbd5e1; padding-bottom: 20px; margin-bottom: 25px; flex-direction: row;">
                    <div style="float: left;">
                        <h4 style="font-size: 24px; font-weight: 900; color: #1e3a8a; margin: 0; letter-spacing: -0.02em;">Diva</h4>
                        <p style="font-size: 9px; text-transform: uppercase; font-weight: bold; color: #64748b; margin: 2px 0 0 0; letter-spacing: 0.1em;">The Salon</p>
                        <p style="font-size: 10px; color: #64748b; margin: 10px 0 0 0; line-height: 1.4;">
                            12, Connaught Place Outer Circle<br/>
                            New Delhi, DL 110001
                        </p>
                    </div>
                    <div style="text-align: right; float: right;">
                        <h5 style="font-size: 16px; font-weight: bold; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">Salary Slip</h5>
                        <p style="font-size: 12px; color: #2563eb; font-weight: bold; margin: 5px 0 0 0;">Month ${payroll.month} / ${payroll.year}</p>
                    </div>
                    <div style="clear: both;"></div>
                </div>

                <div style="background-color: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 25px; display: flex; justify-content: space-between; flex-direction: row;">
                    <div style="width: 25%; float: left;">
                        <span style="font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 3px;">Employee Name</span>
                        <strong style="font-size: 11px; color: #1e293b;">${employee.firstName} ${employee.lastName}</strong>
                    </div>
                    <div style="width: 25%; float: left;">
                        <span style="font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 3px;">Employee ID</span>
                        <strong style="font-size: 11px; color: #1e293b;">${payroll.employeeId}</strong>
                    </div>
                    <div style="width: 25%; float: left;">
                        <span style="font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 3px;">Designation</span>
                        <strong style="font-size: 11px; color: #1e293b; text-transform: capitalize;">${employee.role}</strong>
                    </div>
                    <div style="width: 25%; float: left; text-align: right;">
                        <span style="font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 3px;">Statement Date</span>
                        <strong style="font-size: 11px; color: #1e293b;">${new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}</strong>
                    </div>
                    <div style="clear: both;"></div>
                </div>

                <div style="display: flex; gap: 30px; margin-bottom: 30px; flex-direction: row;">
                    <div style="flex: 1; width: 48%; float: left;">
                        <div style="font-size: 10px; font-weight: bold; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 10px;">Earnings</div>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="border-bottom: 1px solid #e2e8f0;">
                                    <th style="text-align: left; padding: 6px 0; color: #64748b; font-size: 10px;">Description</th>
                                    <th style="text-align: right; padding: 6px 0; color: #64748b; font-size: 10px;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 8px 0; color: #334155;">Basic Salary</td>
                                    <td style="text-align: right; padding: 8px 0; font-weight: 600;">$${basicPay.toLocaleString()}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 8px 0; color: #334155;">HRA (House Rent Allow.)</td>
                                    <td style="text-align: right; padding: 8px 0; font-weight: 600;">$${hra.toLocaleString()}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 8px 0; color: #334155;">Medical Allowance</td>
                                    <td style="text-align: right; padding: 8px 0; font-weight: 600;">$${medical.toLocaleString()}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 8px 0; color: #334155;">Travel Allowance</td>
                                    <td style="text-align: right; padding: 8px 0; font-weight: 600;">$${travel.toLocaleString()}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 8px 0; color: #334155;">Overtime Pay</td>
                                    <td style="text-align: right; padding: 8px 0; font-weight: 600; color: #16a34a;">+$${payroll.overtimeAmount.toLocaleString()}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 8px 0; color: #334155;">Other Allowances</td>
                                    <td style="text-align: right; padding: 8px 0; font-weight: 600;">$${otherAllow.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div style="flex: 1; width: 48%; float: right; border-left: 1px solid #e2e8f0; padding-left: 4%;">
                        <div style="font-size: 10px; font-weight: bold; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 10px;">Deductions</div>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="border-bottom: 1px solid #e2e8f0;">
                                    <th style="text-align: left; padding: 6px 0; color: #64748b; font-size: 10px;">Description</th>
                                    <th style="text-align: right; padding: 6px 0; color: #64748b; font-size: 10px;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 8px 0; color: #334155;">Provident Fund (PF)</td>
                                    <td style="text-align: right; padding: 8px 0; font-weight: 600; color: #dc2626;">-$${pf.toLocaleString()}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 8px 0; color: #334155;">Professional Tax</td>
                                    <td style="text-align: right; padding: 8px 0; font-weight: 600; color: #dc2626;">-$${pt.toLocaleString()}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 8px 0; color: #334155;">Leave Deduction</td>
                                    <td style="text-align: right; padding: 8px 0; font-weight: 600; color: #dc2626;">-$${leaveDeduction.toLocaleString()}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 8px 0; color: #334155;">Other Deductions</td>
                                    <td style="text-align: right; padding: 8px 0; font-weight: 600; color: #dc2626;">-$${otherDeduction.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div style="clear: both;"></div>
                </div>

                <div style="display: flex; justify-content: flex-end; margin-bottom: 40px; flex-direction: row;">
                    <div style="width: 280px; background-color: #f1f5f9; border-radius: 12px; padding: 15px; float: right;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; flex-direction: row;">
                            <span style="color: #64748b;">Gross Earnings:</span>
                            <strong style="color: #1e293b; float: right;">$${totalEarnings.toLocaleString()}</strong>
                            <div style="clear: both;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; flex-direction: row;">
                            <span style="color: #64748b;">Total Deductions:</span>
                            <strong style="color: #dc2626; float: right;">-$${payroll.deductions.toLocaleString()}</strong>
                            <div style="clear: both;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; color: #1e3a8a; flex-direction: row;">
                            <span>Net Paid Salary:</span>
                            <span style="float: right;">$${payroll.netSalary.toLocaleString()}</span>
                            <div style="clear: both;"></div>
                        </div>
                    </div>
                    <div style="clear: both;"></div>
                </div>

                <div style="display: flex; justify-content: space-between; margin-top: 50px; text-align: center; font-size: 10px; color: #64748b; flex-direction: row;">
                    <div style="float: left;">
                        <div style="width: 150px; border-bottom: 1px solid #cbd5e1; margin-bottom: 5px;"></div>
                        <span>Employee Signature</span>
                    </div>
                    <div style="float: right;">
                        <div style="width: 150px; border-bottom: 1px solid #cbd5e1; margin-bottom: 5px;"></div>
                        <span>Authorized Signatory</span>
                    </div>
                    <div style="clear: both;"></div>
                </div>
            </div>
        `;
        document.body.appendChild(container);

        const opt = {
            margin: 10,
            filename: `Payslip_${employee.firstName}_${employee.lastName}_Month_${payroll.month}_${payroll.year}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
            exporter().from(container).set(opt).save()
                .then(() => {
                    toast.success("PDF statement downloaded successfully!");
                    document.body.removeChild(container);
                })
                .catch(err => {
                    console.error("PDF generation error:", err);
                    toast.error("Failed to generate PDF file");
                    document.body.removeChild(container);
                });
        } catch (err) {
            console.error("PDF trigger error:", err);
            toast.error("Error generating PDF: " + err.message);
            document.body.removeChild(container);
        }
    };

    return (
        <DashboardLayout 
            title="Payroll Details" 
            subtitle={`Monthly Wage Ledger for ${employee.firstName} ${employee.lastName}`}
        >
            {/* Back Button */}
            <button
                onClick={() => navigate("/payroll")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-450 dark:hover:text-blue-400 transition mb-6"
            >
                <FiArrowLeft /> Back to Ledgers
            </button>

            <div className="space-y-6">
                {/* Actions row */}
                <PayrollActions 
                    onPrint={handlePrintOrPDF} 
                    onDownload={handleDownloadPDF}
                />

                {/* Left & Right Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Employee Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <EmployeeInfoCard employee={employee} payroll={payroll} />
                        <PaymentCard payroll={payroll} />
                    </div>

                    {/* Right: Salary summary details */}
                    <div className="lg:col-span-2">
                        <SalarySummaryCard payroll={payroll} />
                    </div>
                </div>

                {/* Premium Official Salary Slip Component */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">Salary Slip Document Preview</h3>
                    <SalarySlipCard 
                        payroll={payroll} 
                        employee={employee}
                        basicPay={basicPay}
                        hra={hra}
                        medical={medical}
                        travel={travel}
                        otherAllow={otherAllow}
                        totalEarnings={totalEarnings}
                        pf={pf}
                        pt={pt}
                        leaveDeduction={leaveDeduction}
                        otherDeduction={otherDeduction}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}

/* ==========================================
   REUSABLE SUB-COMPONENTS (UNDER 150 LINES)
   ========================================== */

function PayrollActions({ onDownload, onPrint }) {
    return (
        <div className="flex flex-wrap gap-2 justify-end">
            <button 
                onClick={onDownload}
                className="h-10 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-650 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition px-4 inline-flex items-center gap-1.5 shadow-xs"
            >
                <FiDownload className="text-sm" /> Download PDF
            </button>
            <button 
                onClick={onPrint}
                className="h-10 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-650 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition px-4 inline-flex items-center gap-1.5 shadow-xs"
            >
                <FiPrinter className="text-sm" /> Print Salary Slip
            </button>
        </div>
    );
}

function EmployeeInfoCard({ employee, payroll }) {
    const statusColors = {
        paid: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900",
        generated: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900",
        draft: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
    };

    return (
        <div className="panel-surface rounded-3xl p-6 shadow-sm flex flex-col items-center text-center gap-4">
            {employee.profileImage ? (
                <img src={employee.profileImage} alt={employee.firstName} className="h-20 w-20 rounded-2xl object-cover border-2 border-blue-500/10 shadow-sm" />
            ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-2xl font-black text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    {employee.firstName?.[0]}{employee.lastName?.[0]}
                </div>
            )}

            <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">{employee.firstName} {employee.lastName}</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold mt-0.5 capitalize">{employee.role}</p>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase mt-2 border ${statusColors[payroll.status] || statusColors.draft}`}>
                    {payroll.status}
                </span>
            </div>

            <div className="w-full border-t border-slate-100 dark:border-slate-800 pt-4 text-xs text-left space-y-2.5">
                <div className="flex justify-between">
                    <span className="text-slate-400">Employee ID</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{payroll.employeeId}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Department</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{employee.role === "manager" ? "Administration" : "Styling Chair"}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Joining Date</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(employee.joiningDate)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Bank Name</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">HDFC Bank Ltd</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Account Number</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">XXXX XXXX 9821</span>
                </div>
            </div>
        </div>
    );
}

function SalarySummaryCard({ payroll }) {
    const workingDays = 30;
    const leaveDays = Math.min(4, Math.floor(payroll.deductions / 100));
    const presentDays = workingDays - leaveDays;
    const overtimeHours = Math.round(payroll.overtimeAmount / 35);

    const metricItem = (label, val, colorClass = "text-slate-800 dark:text-slate-100") => (
        <div className="bg-slate-50 dark:bg-slate-950/20 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">{label}</span>
            <strong className={`text-base block mt-1.5 ${colorClass}`}>{val}</strong>
        </div>
    );

    return (
        <div className="panel-surface rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Salary Summary</h3>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-450 px-2.5 py-0.5 rounded-lg">Month {payroll.month} / {payroll.year}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metricItem("Working Days", workingDays)}
                {metricItem("Present Days", presentDays, "text-emerald-600 dark:text-emerald-500")}
                {metricItem("Leave Days", leaveDays, leaveDays > 0 ? "text-orange-500" : "text-slate-400")}
                {metricItem("Overtime Hours", `${overtimeHours} hrs`, overtimeHours > 0 ? "text-blue-600 dark:text-blue-450" : "text-slate-400")}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Base Salary</span>
                    <strong className="text-slate-700 dark:text-slate-350">${payroll.baseSalary.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Overtime Allowances</span>
                    <strong className="text-emerald-600 font-semibold">+${payroll.overtimeAmount.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Leave Deductions</span>
                    <strong className="text-red-500 font-semibold">-${payroll.deductions.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3 text-sm">
                    <span className="font-bold text-slate-850 dark:text-slate-205">Net Monthly Salary</span>
                    <strong className="text-blue-600 dark:text-blue-450 text-base">${payroll.netSalary.toLocaleString()}</strong>
                </div>
            </div>
        </div>
    );
}

function PaymentCard({ payroll }) {
    return (
        <div className="panel-surface rounded-3xl p-5 shadow-sm space-y-4 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Payout Details</h4>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-slate-450">Payment Method</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Bank Transfer (NEFT)</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-450">Transaction ID</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">TXN$${payroll._id?.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-450">Generated Date</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(payroll.createdAt)}</span>
                </div>
            </div>
        </div>
    );
}

function EarningsTable({ basic, hra, medical, travel, overtime, otherAllow }) {
    const rows = [
        { label: "Basic Salary", val: basic },
        { label: "House Rent Allowance (HRA)", val: hra },
        { label: "Medical Allowance", val: medical },
        { label: "Travel Allowance", val: travel },
        { label: "Overtime Pay", val: overtime, plus: true },
        { label: "Other Allowance", val: otherAllow }
    ];

    return (
        <div className="space-y-3">
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5">Earnings</div>
            <table className="w-full text-xs">
                <tbody>
                    {rows.map(r => (
                        <tr key={r.label} className="border-b border-slate-50 dark:border-slate-900/50 last:border-0">
                            <td className="py-2 text-slate-500 dark:text-slate-400">{r.label}</td>
                            <td className={`py-2 text-right font-semibold ${r.plus ? "text-emerald-600 dark:text-emerald-500" : "text-slate-700 dark:text-slate-300"}`}>
                                ${r.val.toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function DeductionsTable({ pf, pt, leave, other }) {
    const rows = [
        { label: "Provident Fund (PF)", val: pf },
        { label: "Professional Tax", val: pt },
        { label: "Leave Deduction", val: leave },
        { label: "Other Deductions", val: other }
    ];

    return (
        <div className="space-y-3">
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5">Deductions</div>
            <table className="w-full text-xs">
                <tbody>
                    {rows.map(r => (
                        <tr key={r.label} className="border-b border-slate-50 dark:border-slate-900/50 last:border-0">
                            <td className="py-2 text-slate-500 dark:text-slate-400">{r.label}</td>
                            <td className="py-2 text-right font-semibold text-red-500">
                                -${r.val.toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function SalarySlipCard({ 
    payroll, employee, basicPay, hra, medical, travel, otherAllow, 
    totalEarnings, pf, pt, leaveDeduction, otherDeduction 
}) {
    return (
        <div id="salary-slip-card" className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6 max-w-[800px] mx-auto text-xs text-slate-800 dark:text-slate-100">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-5">
                <div>
                    <h4 className="text-lg font-black text-slate-850 dark:text-slate-55 tracking-tight">Diva</h4>
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mt-0.5">The Salon</p>
                    <p className="text-[9px] text-slate-400 mt-1.5 leading-relaxed font-medium">
                        12, Connaught Place Outer Circle<br/>
                        New Delhi, DL 110001
                    </p>
                </div>
                <div className="text-right">
                    <h5 className="text-base font-bold text-slate-850 dark:text-slate-100 uppercase tracking-wider">Salary Slip</h5>
                    <p className="text-xs text-blue-600 dark:text-blue-450 font-bold mt-1">Month {payroll.month} / {payroll.year}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-950/20 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold block">Employee Name</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{employee.firstName} {employee.lastName}</span>
                </div>
                <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold block">Employee ID</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{payroll.employeeId}</span>
                </div>
                <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold block">Designation</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5 capitalize">{employee.role}</span>
                </div>
                <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold block">Statement Date</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                <EarningsTable 
                    basic={basicPay} 
                    hra={hra} 
                    medical={medical} 
                    travel={travel} 
                    overtime={payroll.overtimeAmount} 
                    otherAllow={otherAllow} 
                />
                <DeductionsTable 
                    pf={pf} 
                    pt={pt} 
                    leave={leaveDeduction} 
                    other={otherDeduction} 
                />
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col md:flex-row md:justify-between items-end gap-4">
                <div className="text-[10px] text-slate-400 leading-relaxed max-w-[320px]">
                    <div className="flex justify-between py-0.5">
                        <span>Payment Method:</span>
                        <strong className="text-slate-650 dark:text-slate-300 font-semibold ml-2">Bank Transfer (NEFT)</strong>
                    </div>
                    <div className="flex justify-between py-0.5">
                        <span>Transaction ID:</span>
                        <strong className="text-slate-650 dark:text-slate-300 font-mono ml-2">TXN${payroll._id?.slice(-8).toUpperCase()}</strong>
                    </div>
                </div>

                <div className="w-full md:w-[300px] bg-slate-50 dark:bg-slate-950/20 rounded-xl p-4 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex justify-between mb-1.5">
                        <span className="text-slate-450">Gross Salary</span>
                        <strong className="text-slate-700 dark:text-slate-300">${totalEarnings.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span className="text-slate-450">Total Deductions</span>
                        <strong className="text-red-500">-${payroll.deductions.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2 text-sm font-bold">
                        <span className="text-slate-800 dark:text-slate-250">Net Paid Salary</span>
                        <span className="text-blue-600 dark:text-blue-450">${payroll.netSalary.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8 text-center text-[10px] text-slate-400">
                <div>
                    <div className="w-[160px] border-b border-slate-200 dark:border-slate-800 mx-auto mb-1.5 h-6"></div>
                    <span>Employee Signature</span>
                </div>
                <div>
                    <div className="w-[160px] border-b border-slate-200 dark:border-slate-800 mx-auto mb-1.5 h-6"></div>
                    <span>Authorized Signatory</span>
                </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-center text-[9px] text-slate-400">
                This is a computer generated salary slip.
            </div>
        </div>
    );
}
