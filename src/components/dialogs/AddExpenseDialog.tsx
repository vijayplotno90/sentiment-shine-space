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
    date: today(), category: "other" as ExpenseCategory, vendor: "", vendorGstin: "",
    description: "", amount: 0, gstRate: tax.gstRate, paymentMethod: "Bank Transfer",
    isAsset: false, assetTag: "",
  });

  const gstAmount = (form.amount * form.gstRate) / 100;
  const total = form.amount + gstAmount;

  const save = () => {
    if (!form.vendor || form.amount <= 0) { toast.error("Vendor & amount required"); return; }
    addExpense({
      date: form.date, category: form.category, vendor: form.vendor, vendorGstin: form.vendorGstin,
      description: form.description, amount: form.amount, gstAmount, total,
      paymentMethod: form.paymentMethod, isAsset: form.isAsset, assetTag: form.assetTag || undefined,
    });
    toast.success("Expense recorded");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
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
          <div><Label>Vendor GSTIN</Label><Input value={form.vendorGstin} onChange={(e) => setForm({ ...form, vendorGstin: e.target.value })} /></div>
          <div className="col-span-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label>Amount (₹) *</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></div>
          <div><Label>GST Rate (%)</Label><Input type="number" value={form.gstRate} onChange={(e) => setForm({ ...form, gstRate: Number(e.target.value) })} /></div>
          <div><Label>Payment Method</Label><Input value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} /></div>
          <div className="flex items-end gap-2">
            <div className="flex-1"><Label>Capital Asset?</Label>
              <div className="h-10 flex items-center gap-2">
                <Switch checked={form.isAsset} onCheckedChange={(v) => setForm({ ...form, isAsset: v })} />
                <span className="text-sm text-muted-foreground">{form.isAsset ? "Yes (e.g. furniture, laptop)" : "No (consumable)"}</span>
              </div>
            </div>
          </div>
          {form.isAsset && (
            <div className="col-span-2"><Label>Asset Tag</Label><Input value={form.assetTag} onChange={(e) => setForm({ ...form, assetTag: e.target.value })} placeholder="EQUIP-002" /></div>
          )}
          <div className="col-span-2 p-3 rounded-lg bg-secondary/50 text-sm">
            Subtotal: ₹{form.amount.toLocaleString("en-IN")} • GST: ₹{Math.round(gstAmount).toLocaleString("en-IN")} • <strong>Total: ₹{Math.round(total).toLocaleString("en-IN")}</strong>
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
