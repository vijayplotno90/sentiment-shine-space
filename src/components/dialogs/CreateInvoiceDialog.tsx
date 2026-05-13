import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";
import { addInvoice, updateInvoice, useClients, useProjects, useTaxSettings, type Invoice, type LineItem } from "@/data/store";
import { today } from "@/lib/format";
import { toast } from "sonner";

export const CreateInvoiceDialog = ({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing?: Invoice }) => {
  const clients = useClients();
  const projects = useProjects();
  const tax = useTaxSettings();

  const [form, setForm] = useState(() => editing ?? {
    clientId: clients[0]?.id || "",
    projectId: undefined as string | undefined,
    lineItems: [{ id: crypto.randomUUID(), description: "", quantity: 1, rate: 0 }] as LineItem[],
    issueDate: today(),
    dueDate: today(),
    notes: "",
    interstate: false,
    status: "draft" as const,
  });

  const clientProjects = useMemo(() => projects.filter((p) => p.clientId === form.clientId), [projects, form.clientId]);
  const subtotal = form.lineItems.reduce((s, li) => s + li.quantity * li.rate, 0);
  const cgst = form.interstate ? 0 : (subtotal * tax.cgstRate) / 100;
  const sgst = form.interstate ? 0 : (subtotal * tax.sgstRate) / 100;
  const igst = form.interstate ? (subtotal * tax.igstRate) / 100 : 0;
  const gstAmount = cgst + sgst + igst;
  const total = subtotal + gstAmount;

  const updateLine = (id: string, patch: Partial<LineItem>) =>
    setForm((f) => ({ ...f, lineItems: f.lineItems.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  const addLine = () => setForm((f) => ({ ...f, lineItems: [...f.lineItems, { id: crypto.randomUUID(), description: "", quantity: 1, rate: 0 }] }));
  const removeLine = (id: string) => setForm((f) => ({ ...f, lineItems: f.lineItems.filter((l) => l.id !== id) }));

  const save = () => {
    if (!form.clientId || form.lineItems.length === 0 || subtotal <= 0) { toast.error("Add at least one line item"); return; }
    const payload = {
      clientId: form.clientId, projectId: form.projectId, lineItems: form.lineItems,
      subtotal, taxRate: form.interstate ? tax.igstRate : tax.cgstRate + tax.sgstRate,
      cgst, sgst, igst, gstAmount, total,
      status: form.status, issueDate: form.issueDate, dueDate: form.dueDate, notes: form.notes,
      interstate: form.interstate,
    };
    if (editing) {
      updateInvoice(editing.id, payload);
      toast.success("Invoice updated");
    } else {
      const num = addInvoice(payload);
      toast.success(`Invoice ${num} created`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editing ? `Edit ${editing.number}` : "Create Invoice"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Client *</Label>
            <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v, projectId: undefined })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} — {c.company}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Project</Label>
            <Select value={form.projectId || "none"} onValueChange={(v) => setForm({ ...form, projectId: v === "none" ? undefined : v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {clientProjects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Issue Date</Label><Input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} /></div>
          <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
          <div className="col-span-2 flex items-center gap-2 p-3 rounded bg-secondary/50">
            <Switch checked={form.interstate} onCheckedChange={(v) => setForm({ ...form, interstate: v })} />
            <span className="text-sm">Inter-state supply (apply IGST instead of CGST+SGST)</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Line Items</Label>
            <Button size="sm" variant="outline" onClick={addLine}><Plus className="h-3 w-3" /> Add Line</Button>
          </div>
          {form.lineItems.map((li) => (
            <div key={li.id} className="grid grid-cols-12 gap-2 items-center">
              <Input className="col-span-6" placeholder="Description" value={li.description} onChange={(e) => updateLine(li.id, { description: e.target.value })} />
              <Input className="col-span-2" type="number" placeholder="Qty" value={li.quantity} onChange={(e) => updateLine(li.id, { quantity: Number(e.target.value) })} />
              <Input className="col-span-3" type="number" placeholder="Rate (₹)" value={li.rate} onChange={(e) => updateLine(li.id, { rate: Number(e.target.value) })} />
              <Button className="col-span-1" size="icon" variant="ghost" onClick={() => removeLine(li.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-lg bg-secondary/50 text-sm space-y-1">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
          {!form.interstate && (
            <>
              <div className="flex justify-between"><span>CGST ({tax.cgstRate}%)</span><span>₹{cgst.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span>SGST ({tax.sgstRate}%)</span><span>₹{sgst.toLocaleString("en-IN")}</span></div>
            </>
          )}
          {form.interstate && <div className="flex justify-between"><span>IGST ({tax.igstRate}%)</span><span>₹{igst.toLocaleString("en-IN")}</span></div>}
          <div className="flex justify-between font-bold border-t pt-1 mt-1"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
        </div>

        <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>{editing ? "Save Changes" : "Create Invoice"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
