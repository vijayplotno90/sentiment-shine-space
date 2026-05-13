import JSZip from "jszip";
import type { Invoice, Expense, Client, TaxSettings } from "@/data/store";
import { generateInvoicePdf } from "./invoicePdf";

const csvEscape = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const toCsv = (rows: (string | number)[][]) => rows.map((r) => r.map(csvEscape).join(",")).join("\n");

export async function buildGstZip(opts: {
  invoices: Invoice[];
  expenses: Expense[];
  clients: Client[];
  tax: TaxSettings;
  period: string;
}): Promise<Blob> {
  const zip = new JSZip();
  const { invoices, expenses, clients, tax, period } = opts;

  // GSTR-1 style outward supplies
  const invHeader = ["Invoice No", "Invoice Date", "Customer", "Customer GSTIN", "Place", "Taxable Value", "CGST", "SGST", "IGST", "Total", "Status"];
  const invRows: (string | number)[][] = invoices.map((i) => {
    const c = clients.find((cl) => cl.id === i.clientId);
    return [i.number, i.issueDate, c?.company || "", c?.gstin || "", c?.address || "", i.subtotal, i.cgst, i.sgst, i.igst, i.total, i.status];
  });
  zip.file("GSTR1-outward-supplies.csv", toCsv([invHeader, ...invRows]));

  // GSTR-2 style inward supplies (expenses with vendor GSTIN)
  const expHeader = ["Date", "Vendor", "Vendor GSTIN", "Category", "Description", "Taxable Value", "GST", "Total", "Asset?", "Asset Tag"];
  const expRows: (string | number)[][] = expenses.map((e) => [
    e.date, e.vendor, e.vendorGstin || "", e.category, e.description, e.amount, e.gstAmount, e.total, e.isAsset ? "Yes" : "No", e.assetTag || "",
  ]);
  zip.file("GSTR2-inward-supplies.csv", toCsv([expHeader, ...expRows]));

  // Summary
  const totalRevenue = invoices.reduce((s, i) => s + i.subtotal, 0);
  const totalGstCollected = invoices.reduce((s, i) => s + i.gstAmount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalGstPaid = expenses.reduce((s, e) => s + e.gstAmount, 0);
  const summary = [
    `GST Filing Package — ${period}`,
    `Generated: ${new Date().toISOString()}`,
    ``,
    `Company: ${tax.company.name}`,
    `GSTIN: ${tax.company.gstin}`,
    `PAN: ${tax.company.pan}`,
    ``,
    `--- Outward Supplies (Sales) ---`,
    `Invoice count: ${invoices.length}`,
    `Taxable value: ₹${totalRevenue.toLocaleString("en-IN")}`,
    `GST collected: ₹${totalGstCollected.toLocaleString("en-IN")}`,
    ``,
    `--- Inward Supplies (Expenses) ---`,
    `Expense count: ${expenses.length}`,
    `Taxable value: ₹${totalExpenses.toLocaleString("en-IN")}`,
    `GST paid (input credit): ₹${totalGstPaid.toLocaleString("en-IN")}`,
    ``,
    `--- Net GST Payable ---`,
    `₹${(totalGstCollected - totalGstPaid).toLocaleString("en-IN")}`,
  ].join("\n");
  zip.file("SUMMARY.txt", summary);

  // Individual invoice PDFs
  const invoicesFolder = zip.folder("invoices")!;
  for (const inv of invoices) {
    const c = clients.find((cl) => cl.id === inv.clientId);
    if (!c) continue;
    const pdf = generateInvoicePdf(inv, c, tax);
    invoicesFolder.file(`${inv.number}.pdf`, pdf.output("blob"));
  }

  return zip.generateAsync({ type: "blob" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
