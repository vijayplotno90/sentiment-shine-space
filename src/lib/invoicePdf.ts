import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Invoice, Client, TaxSettings } from "@/data/store";

export function generateInvoicePdf(invoice: Invoice, client: Client, tax: TaxSettings): jsPDF {
  const doc = new jsPDF();
  const company = tax.company;

  doc.setFontSize(20).setFont("helvetica", "bold");
  doc.text("TAX INVOICE", 105, 18, { align: "center" });

  doc.setFontSize(11).setFont("helvetica", "bold");
  doc.text(company.name, 14, 30);
  doc.setFont("helvetica", "normal").setFontSize(9);
  doc.text(company.address, 14, 35);
  doc.text(`GSTIN: ${company.gstin}    PAN: ${company.pan}`, 14, 40);
  doc.text(`Email: ${company.email}    Phone: ${company.phone}`, 14, 45);

  doc.setFont("helvetica", "bold").setFontSize(10);
  doc.text(`Invoice #: ${invoice.number}`, 140, 30);
  doc.text(`Issue Date: ${invoice.issueDate}`, 140, 35);
  doc.text(`Due Date: ${invoice.dueDate}`, 140, 40);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 140, 45);

  doc.setDrawColor(200).line(14, 52, 196, 52);

  doc.setFont("helvetica", "bold").setFontSize(10);
  doc.text("Bill To:", 14, 60);
  doc.setFont("helvetica", "normal");
  doc.text(client.name, 14, 65);
  doc.text(client.company, 14, 70);
  if (client.address) doc.text(client.address, 14, 75);
  if (client.gstin) doc.text(`GSTIN: ${client.gstin}`, 14, 80);

  autoTable(doc, {
    startY: 90,
    head: [["#", "Description", "Qty", "Rate (₹)", "Amount (₹)"]],
    body: invoice.lineItems.map((li, i) => [
      i + 1, li.description, li.quantity, li.rate.toLocaleString("en-IN"),
      (li.quantity * li.rate).toLocaleString("en-IN"),
    ]),
    headStyles: { fillColor: [40, 60, 100] },
    styles: { fontSize: 9 },
  });

  // @ts-expect-error jsPDF autoTable plugin
  const finalY = doc.lastAutoTable.finalY + 5;
  const right = 196;
  const lh = 6;
  let y = finalY;
  doc.setFontSize(10);
  const row = (label: string, val: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(label, 130, y);
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
  row("Total:", `₹${invoice.total.toLocaleString("en-IN")}`, true);

  if (invoice.notes) {
    y += 6;
    doc.setFont("helvetica", "bold").text("Notes:", 14, y);
    y += 5;
    doc.setFont("helvetica", "normal").setFontSize(9);
    doc.text(doc.splitTextToSize(invoice.notes, 180), 14, y);
  }

  doc.setFontSize(8).setTextColor(120);
  doc.text("This is a computer-generated invoice and does not require a signature.", 105, 285, { align: "center" });

  return doc;
}
