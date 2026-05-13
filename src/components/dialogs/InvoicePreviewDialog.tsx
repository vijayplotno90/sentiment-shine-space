import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useClients, useTaxSettings, type Invoice } from "@/data/store";
import { generateInvoicePdf } from "@/lib/invoicePdf";
import { downloadBlob } from "@/lib/gstExport";

export const InvoicePreviewDialog = ({ invoice, open, onOpenChange }: { invoice: Invoice | null; open: boolean; onOpenChange: (o: boolean) => void }) => {
  const clients = useClients();
  const tax = useTaxSettings();
  if (!invoice) return null;
  const client = clients.find((c) => c.id === invoice.clientId);
  if (!client) return null;

  const download = () => {
    const pdf = generateInvoicePdf(invoice, client, tax);
    downloadBlob(pdf.output("blob"), `${invoice.number}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{invoice.number}</DialogTitle></DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="flex justify-between border-b pb-3">
            <div>
              <div className="font-bold text-lg">{tax.company.name}</div>
              <div className="text-muted-foreground">{tax.company.address}</div>
              <div className="text-xs text-muted-foreground">GSTIN: {tax.company.gstin}</div>
            </div>
            <div className="text-right">
              <div className="font-bold">TAX INVOICE</div>
              <div className="text-xs text-muted-foreground">Date: {invoice.issueDate}</div>
              <div className="text-xs text-muted-foreground">Due: {invoice.dueDate}</div>
            </div>
          </div>
          <div>
            <div className="font-semibold">Bill To</div>
            <div>{client.name} — {client.company}</div>
            <div className="text-muted-foreground">{client.address}</div>
            {client.gstin && <div className="text-xs text-muted-foreground">GSTIN: {client.gstin}</div>}
          </div>
          <table className="w-full text-sm">
            <thead className="bg-secondary"><tr><th className="text-left p-2">Description</th><th className="p-2 text-right">Qty</th><th className="p-2 text-right">Rate</th><th className="p-2 text-right">Amount</th></tr></thead>
            <tbody>
              {invoice.lineItems.map((li) => (
                <tr key={li.id} className="border-b"><td className="p-2">{li.description}</td><td className="p-2 text-right">{li.quantity}</td><td className="p-2 text-right">₹{li.rate.toLocaleString("en-IN")}</td><td className="p-2 text-right">₹{(li.quantity * li.rate).toLocaleString("en-IN")}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="ml-auto w-64 space-y-1">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{invoice.subtotal.toLocaleString("en-IN")}</span></div>
            {invoice.interstate ? (
              <div className="flex justify-between"><span>IGST</span><span>₹{invoice.igst.toLocaleString("en-IN")}</span></div>
            ) : (<>
              <div className="flex justify-between"><span>CGST</span><span>₹{invoice.cgst.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span>SGST</span><span>₹{invoice.sgst.toLocaleString("en-IN")}</span></div>
            </>)}
            <div className="flex justify-between font-bold border-t pt-1"><span>Total</span><span>₹{invoice.total.toLocaleString("en-IN")}</span></div>
          </div>
          {invoice.notes && <div className="text-muted-foreground text-xs">Notes: {invoice.notes}</div>}
        </div>
        <DialogFooter>
          <Button onClick={download}><Download className="h-4 w-4" /> Download PDF</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
