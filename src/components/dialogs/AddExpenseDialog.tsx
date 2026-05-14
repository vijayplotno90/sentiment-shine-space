import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { addExpense, useTaxSettings, type ExpenseCategory } from "@/data/store";
import { today } from "@/lib/format";
import { toast } from "sonner";

const categories: ExpenseCategory[] = ["furniture", "equipment", "software", "travel", "utilities", "marketing", "salary", "other"];

export const AddExpenseDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => {
  const tax = useTaxSettings();
  const [form, setForm] = useState({
    date: today(), category: "other" as ExpenseCategory, vendor: "", vendorGstin: "", vendorPan: "",
    description: "", hsn: "", amount: 0, gstRate: tax.gstRate, paymentMethod: "Bank Transfer",
    isAsset: false, assetTag: "",
    reverseCharge: false, itcEligible: true, tdsDeducted: 0,
  });

  const gstAmount = (form.amount * form.gstRate) / 100;
  const total = form.amount + gstAmount;
  const netPayable = total - Number(form.tdsDeducted || 0);

  const save = () => {
    if (!form.vendor || form.amount <= 0) { toast.error("Vendor & amount required"); return; }
    addExpense({
      date: form.date, category: form.category, vendor: form.vendor,
      vendorGstin: form.vendorGstin || undefined, vendorPan: form.vendorPan || undefined,
      description: form.description, hsn: form.hsn || undefined,
      amount: form.amount, gstAmount, total,
      paymentMethod: form.paymentMethod, isAsset: form.isAsset, assetTag: form.assetTag || undefined,
      reverseCharge: form.reverseCharge, itcEligible: form.itcEligible,
      tdsDeducted: Number(form.tdsDeducted) || 0,
    });
    toast.success("Expense recorded");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Business Expense</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as ExpenseCategory })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Vendor *</Label><Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} /></div>
          <div><Label>Vendor GSTIN</Label><Input value={form.vendorGstin} onChange={(e) => setForm({ ...form, vendorGstin: e.target.value })} placeholder="for ITC claim" /></div>
          <div><Label>Vendor PAN</Label><Input value={form.vendorPan} onChange={(e) => setForm({ ...form, vendorPan: e.target.value })} placeholder="for TDS reporting" /></div>
          <div><Label>HSN/SAC</Label><Input value={form.hsn} onChange={(e) => setForm({ ...form, hsn: e.target.value })} placeholder="optional" /></div>
          <div className="col-span-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label>Taxable Amount (₹) *</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></div>
          <div><Label>GST Rate (%)</Label><Input type="number" value={form.gstRate} onChange={(e) => setForm({ ...form, gstRate: Number(e.target.value) })} /></div>
          <div><Label>Payment Method</Label>
            <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Bank Transfer","UPI","Credit Card","Debit Card","Cheque","Cash"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>TDS Deducted (₹)</Label><Input type="number" value={form.tdsDeducted} onChange={(e) => setForm({ ...form, tdsDeducted: Number(e.target.value) })} placeholder="if you deducted TDS on payment" /></div>

          <label className="flex items-center gap-2 p-2.5 rounded bg-secondary/50 cursor-pointer">
            <Switch checked={form.itcEligible} onCheckedChange={(v) => setForm({ ...form, itcEligible: v })} />
            <span className="text-sm">ITC eligible (claim input GST credit)</span>
          </label>
          <label className="flex items-center gap-2 p-2.5 rounded bg-secondary/50 cursor-pointer">
            <Switch checked={form.reverseCharge} onCheckedChange={(v) => setForm({ ...form, reverseCharge: v })} />
            <span className="text-sm">Reverse Charge (RCM)</span>
          </label>
          <label className="flex items-center gap-2 p-2.5 rounded bg-secondary/50 cursor-pointer col-span-2">
            <Switch checked={form.isAsset} onCheckedChange={(v) => setForm({ ...form, isAsset: v })} />
            <span className="text-sm">{form.isAsset ? "Capital asset (depreciable: laptop, furniture, etc.)" : "Operational expense (consumed in period)"}</span>
          </label>
          {form.isAsset && (
            <div className="col-span-2"><Label>Asset Tag</Label><Input value={form.assetTag} onChange={(e) => setForm({ ...form, assetTag: e.target.value })} placeholder="EQUIP-002" /></div>
          )}

          <div className="col-span-2 p-3 rounded-lg bg-secondary/50 text-sm space-y-1">
            <div className="flex justify-between"><span>Taxable</span><span>₹{form.amount.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between"><span>GST</span><span>₹{Math.round(gstAmount).toLocaleString("en-IN")} {form.itcEligible && <span className="text-emerald-600 text-xs">(ITC claim)</span>}</span></div>
            <div className="flex justify-between font-bold border-t pt-1"><span>Total Bill</span><span>₹{Math.round(total).toLocaleString("en-IN")}</span></div>
            {Number(form.tdsDeducted) > 0 && <div className="flex justify-between text-amber-700"><span>− TDS deducted</span><span>₹{Number(form.tdsDeducted).toLocaleString("en-IN")}</span></div>}
            {Number(form.tdsDeducted) > 0 && <div className="flex justify-between font-bold text-primary"><span>Net Payable to vendor</span><span>₹{Math.round(netPayable).toLocaleString("en-IN")}</span></div>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Add Expense</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
