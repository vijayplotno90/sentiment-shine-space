import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Invoice, Client, TaxSettings } from "@/data/store";
import { inrWords } from "./format";

export function generateInvoicePdf(invoice: Invoice, client: Client, tax: TaxSettings): jsPDF {
  const doc = new jsPDF();
  const company = tax.company;

  doc.setFontSize(18).setFont("helvetica", "bold");
  doc.text("TAX INVOICE", 105, 16, { align: "center" });
  if (invoice.reverseCharge) {
    doc.setFontSize(9).setFont("helvetica", "bold").setTextColor(180, 0, 0);
    doc.text("(Reverse Charge Applicable)", 105, 22, { align: "center" });
    doc.setTextColor(0, 0, 0);
  }

  doc.setFontSize(11).setFont("helvetica", "bold");
  doc.text(company.name, 14, 30);
  doc.setFont("helvetica", "normal").setFontSize(8.5);
  doc.text(company.address, 14, 35);
  doc.text(`GSTIN: ${company.gstin}    PAN: ${company.pan}`, 14, 40);
  doc.text(`State: ${company.stateCode || "—"}    ${company.businessType || ""}`, 14, 45);
  doc.text(`Email: ${company.email}    Phone: ${company.phone}`, 14, 50);

  doc.setFont("helvetica", "bold").setFontSize(9.5);
  doc.text(`Invoice #: ${invoice.number}`, 140, 30);
  doc.text(`Issue Date: ${invoice.issueDate}`, 140, 35);
  doc.text(`Due Date: ${invoice.dueDate}`, 140, 40);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 140, 45);
  if (invoice.poNumber) doc.text(`PO Ref: ${invoice.poNumber}`, 140, 50);

  doc.setDrawColor(200).line(14, 55, 196, 55);

  doc.setFont("helvetica", "bold").setFontSize(9.5);
  doc.text("Bill To:", 14, 62);
  doc.setFont("helvetica", "normal").setFontSize(9);
  doc.text(client.name, 14, 67);
  doc.text(client.company, 14, 72);
  if (client.address) doc.text(client.address, 14, 77);
  let yBill = 82;
  if (client.gstin) { doc.text(`GSTIN: ${client.gstin}`, 14, yBill); yBill += 5; }
  if (client.pan) { doc.text(`PAN: ${client.pan}`, 14, yBill); yBill += 5; }
  if (invoice.placeOfSupply) { doc.text(`Place of Supply: ${invoice.placeOfSupply}`, 14, yBill); yBill += 5; }

  autoTable(doc, {
    startY: Math.max(yBill + 4, 95),
    head: [["#", "Description", "HSN/SAC", "Qty", "Rate (₹)", "Amount (₹)"]],
    body: invoice.lineItems.map((li, i) => [
      i + 1, li.description, li.hsn || "998314", li.quantity,
      li.rate.toLocaleString("en-IN"),
      (li.quantity * li.rate).toLocaleString("en-IN"),
    ]),
    headStyles: { fillColor: [40, 60, 100] },
    styles: { fontSize: 9 },
  });

  // @ts-expect-error jsPDF autoTable plugin
  const finalY = doc.lastAutoTable.finalY + 5;
  const right = 196;
  const lh = 5.5;
  let y = finalY;
  doc.setFontSize(9.5);
  const row = (label: string, val: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(label, 125, y);
    doc.text(val, right, y, { align: "right" });
    y += lh;
  };
  row("Subtotal:", `₹${invoice.subtotal.toLocaleString("en-IN")}`);
  if (invoice.interstate) {
    row(`IGST (${tax.igstRate}%):`, `₹${invoice.igst.toLocaleString("en-IN")}`);
  } else {
    row(`CGST (${tax.cgstRate}%):`, `₹${invoice.cgst.toLocaleString("en-IN")}`);
    row(`SGST (${tax.sgstRate}%):`, `₹${invoice.sgst.toLocaleString("en-IN")}`);
  }
  if (invoice.roundOff) row("Round Off:", `₹${invoice.roundOff.toFixed(2)}`);
  row("Grand Total:", `₹${invoice.total.toLocaleString("en-IN")}`, true);
  if (invoice.tdsDeducted) {
    row(`Less: TDS (${tax.tdsRate}%):`, `₹${invoice.tdsDeducted.toLocaleString("en-IN")}`);
    row("Net Receivable:", `₹${(invoice.total - invoice.tdsDeducted).toLocaleString("en-IN")}`, true);
  }

  // Amount in words
  y += 3;
  doc.setFont("helvetica", "bold").setFontSize(9);
  doc.text("Amount in words:", 14, y);
  doc.setFont("helvetica", "normal");
  const words = inrWords(invoice.total - (invoice.tdsDeducted || 0));
  doc.text(doc.splitTextToSize(words, 180), 14, y + 5);
  y += 14;

  // Bank details
  if (company.bankName || company.upiId) {
    doc.setFont("helvetica", "bold").setFontSize(9.5);
    doc.text("Payment Details:", 14, y);
    y += 5;
    doc.setFont("helvetica", "normal").setFontSize(8.5);
    if (company.bankName) doc.text(`Bank: ${company.bankName}    A/c Name: ${company.accountName || company.name}`, 14, y), y += 4.5;
    if (company.accountNumber) doc.text(`A/c No: ${company.accountNumber}    IFSC: ${company.ifsc || "—"}    Branch: ${company.branch || "—"}`, 14, y), y += 4.5;
    if (company.upiId) doc.text(`UPI: ${company.upiId}`, 14, y), y += 4.5;
  }

  if (invoice.notes) {
    y += 3;
    doc.setFont("helvetica", "bold").setFontSize(9).text("Notes:", 14, y);
    y += 4.5;
    doc.setFont("helvetica", "normal").setFontSize(8.5);
    doc.text(doc.splitTextToSize(invoice.notes, 180), 14, y);
  }

  // Declaration & signature
  doc.setFontSize(8).setTextColor(80);
  doc.text("Declaration: We declare that this invoice shows the actual price of services described and that all particulars are true and correct.", 14, 270, { maxWidth: 180 });
  doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(0);
  doc.text(`For ${company.name}`, 196, 280, { align: "right" });
  doc.setFont("helvetica", "normal").setFontSize(8).text("Authorised Signatory", 196, 290, { align: "right" });
  doc.setFontSize(7).setTextColor(120);
  doc.text("This is a computer-generated invoice.", 14, 290);

  return doc;
}
