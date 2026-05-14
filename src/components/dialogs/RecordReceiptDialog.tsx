import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addReceipt, type Invoice } from "@/data/store";
import { today, inr } from "@/lib/format";
import { toast } from "sonner";

export const RecordReceiptDialog = ({ invoice, open, onOpenChange }: { invoice: Invoice | null; open: boolean; onOpenChange: (o: boolean) => void }) => {
  const due = invoice ? invoice.total - (invoice.tdsDeducted || 0) : 0;
  const [form, setForm] = useState({ date: today(), amount: due, mode: "Bank Transfer", reference: "", notes: "" });

  // reset when invoice changes
  const reset = (inv: Invoice | null) => setForm({ date: today(), amount: inv ? inv.total - (inv.tdsDeducted || 0) : 0, mode: "Bank Transfer", reference: "", notes: "" });

  const save = () => {
    if (!invoice) return;
    if (form.amount <= 0) { toast.error("Amount must be > 0"); return; }
    addReceipt({ invoiceId: invoice.id, date: form.date, amount: form.amount, mode: form.mode, reference: form.reference, notes: form.notes });
    toast.success("Receipt logged");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(invoice); onOpenChange(o); }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Record Payment Receipt</DialogTitle></DialogHeader>
        {invoice && (
          <div className="text-sm bg-secondary/50 p-3 rounded mb-2">
            <div><strong>{invoice.number}</strong> • Total {inr(invoice.total)}</div>
            {!!invoice.tdsDeducted && <div className="text-xs text-muted-foreground">Less TDS {inr(invoice.tdsDeducted)} → Net due {inr(due)}</div>}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Receipt Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div><Label>Amount Received (₹)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></div>
          <div className="col-span-2">
            <Label>Mode</Label>
            <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Bank Transfer","UPI","Cheque","Cash","Credit Card","Wire Transfer"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2"><Label>Reference (UTR / Cheque No / UPI Ref)</Label><Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></div>
          <div className="col-span-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Log Receipt</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
