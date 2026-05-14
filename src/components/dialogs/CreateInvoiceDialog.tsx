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
import { today, STATE_CODES } from "@/lib/format";
import { toast } from "sonner";

export const CreateInvoiceDialog = ({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing?: Invoice }) => {
  const clients = useClients();
  const projects = useProjects();
  const tax = useTaxSettings();

  const [form, setForm] = useState(() => editing ?? {
    clientId: clients[0]?.id || "",
    projectId: undefined as string | undefined,
    lineItems: [{ id: crypto.randomUUID(), description: "", hsn: "998314", quantity: 1, rate: 0 }] as LineItem[],
    issueDate: today(),
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    notes: "",
    interstate: false,
    placeOfSupply: "",
    reverseCharge: false,
    tdsDeducted: 0,
    poNumber: "",
    status: "draft" as const,
  });

  const selectedClient = useMemo(() => clients.find((c) => c.id === form.clientId), [clients, form.clientId]);

  // auto-set place of supply + interstate from client state vs company state
  const autoPlaceOfSupply = () => {
    if (!selectedClient) return;
    const clientState = selectedClient.stateCode;
    const companyState = tax.company.stateCode;
    if (clientState && companyState) {
      const interstate = clientState !== companyState;
      const stateName = STATE_CODES.find((s) => clientState.startsWith(s.code))?.name || clientState;
      setForm((f) => ({ ...f, placeOfSupply: `${stateName} (${clientState.split("-")[0]})`, interstate }));
    }
  };

  const clientProjects = useMemo(() => projects.filter((p) => p.clientId === form.clientId), [projects, form.clientId]);
  const subtotal = form.lineItems.reduce((s, li) => s + li.quantity * li.rate, 0);
  const cgst = form.interstate ? 0 : (subtotal * tax.cgstRate) / 100;
  const sgst = form.interstate ? 0 : (subtotal * tax.sgstRate) / 100;
  const igst = form.interstate ? (subtotal * tax.igstRate) / 100 : 0;
  const gstAmount = cgst + sgst + igst;
  const grossTotal = subtotal + gstAmount;
  const total = Math.round(grossTotal);
  const roundOff = +(total - grossTotal).toFixed(2);
  const tdsAuto = Math.round((subtotal * tax.tdsRate) / 100);

  const updateLine = (id: string, patch: Partial<LineItem>) =>
    setForm((f) => ({ ...f, lineItems: f.lineItems.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  const addLine = () => setForm((f) => ({ ...f, lineItems: [...f.lineItems, { id: crypto.randomUUID(), description: "", hsn: "998314", quantity: 1, rate: 0 }] }));
  const removeLine = (id: string) => setForm((f) => ({ ...f, lineItems: f.lineItems.filter((l) => l.id !== id) }));

  const save = () => {
    if (!form.clientId || form.lineItems.length === 0 || subtotal <= 0) { toast.error("Add at least one line item"); return; }
    const payload = {
      clientId: form.clientId, projectId: form.projectId, lineItems: form.lineItems,
      subtotal, taxRate: form.interstate ? tax.igstRate : tax.cgstRate + tax.sgstRate,
      cgst, sgst, igst, gstAmount, total, roundOff,
      status: form.status, issueDate: form.issueDate, dueDate: form.dueDate, notes: form.notes,
      interstate: form.interstate,
      placeOfSupply: form.placeOfSupply || undefined,
      reverseCharge: form.reverseCharge,
      tdsDeducted: Number(form.tdsDeducted) || 0,
      poNumber: form.poNumber || undefined,
    };
    if (editing) { updateInvoice(editing.id, payload); toast.success("Invoice updated"); }
    else { const num = addInvoice(payload); toast.success(`Invoice ${num} created`); }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editing ? `Edit ${editing.number}` : "Create Tax Invoice"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Client *</Label>
            <Select value={form.clientId} onValueChange={(v) => { setForm({ ...form, clientId: v, projectId: undefined }); setTimeout(autoPlaceOfSupply, 0); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} — {c.company}</SelectItem>)}</SelectContent>
            </Select>
            {selectedClient && <div className="text-xs text-muted-foreground mt-1">GSTIN {selectedClient.gstin || "—"} • PAN {selectedClient.pan || "—"}</div>}
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
          <div><Label>Place of Supply</Label><Input value={form.placeOfSupply} onChange={(e) => setForm({ ...form, placeOfSupply: e.target.value })} placeholder="Karnataka (29)" /></div>
          <div><Label>Client PO Ref</Label><Input value={form.poNumber} onChange={(e) => setForm({ ...form, poNumber: e.target.value })} placeholder="optional" /></div>
          <div className="col-span-2 grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 p-3 rounded bg-secondary/50 cursor-pointer">
              <Switch checked={form.interstate} onCheckedChange={(v) => setForm({ ...form, interstate: v })} />
              <span className="text-sm">Inter-state (IGST instead of CGST+SGST)</span>
            </label>
            <label className="flex items-center gap-2 p-3 rounded bg-secondary/50 cursor-pointer">
              <Switch checked={form.reverseCharge} onCheckedChange={(v) => setForm({ ...form, reverseCharge: v })} />
              <span className="text-sm">Reverse Charge (RCM) applicable</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Line Items (HSN/SAC required for GST)</Label>
            <Button size="sm" variant="outline" onClick={addLine}><Plus className="h-3 w-3" /> Add Line</Button>
          </div>
          {form.lineItems.map((li) => (
            <div key={li.id} className="grid grid-cols-12 gap-2 items-center">
              <Input className="col-span-5" placeholder="Description" value={li.description} onChange={(e) => updateLine(li.id, { description: e.target.value })} />
              <Input className="col-span-2" placeholder="HSN/SAC" value={li.hsn || ""} onChange={(e) => updateLine(li.id, { hsn: e.target.value })} />
              <Input className="col-span-1" type="number" placeholder="Qty" value={li.quantity} onChange={(e) => updateLine(li.id, { quantity: Number(e.target.value) })} />
              <Input className="col-span-3" type="number" placeholder="Rate (₹)" value={li.rate} onChange={(e) => updateLine(li.id, { rate: Number(e.target.value) })} />
              <Button className="col-span-1" size="icon" variant="ghost" onClick={() => removeLine(li.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-secondary/50 text-sm space-y-1">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
            {!form.interstate && (
              <>
                <div className="flex justify-between"><span>CGST ({tax.cgstRate}%)</span><span>₹{cgst.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span>SGST ({tax.sgstRate}%)</span><span>₹{sgst.toLocaleString("en-IN")}</span></div>
              </>
            )}
            {form.interstate && <div className="flex justify-between"><span>IGST ({tax.igstRate}%)</span><span>₹{igst.toLocaleString("en-IN")}</span></div>}
            {roundOff !== 0 && <div className="flex justify-between text-muted-foreground"><span>Round Off</span><span>₹{roundOff.toFixed(2)}</span></div>}
            <div className="flex justify-between font-bold border-t pt-1 mt-1"><span>Grand Total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
            {Number(form.tdsDeducted) > 0 && (
              <div className="flex justify-between text-amber-700"><span>− TDS</span><span>₹{Number(form.tdsDeducted).toLocaleString("en-IN")}</span></div>
            )}
            {Number(form.tdsDeducted) > 0 && (
              <div className="flex justify-between font-bold text-emerald-700"><span>Net Receivable</span><span>₹{(total - Number(form.tdsDeducted)).toLocaleString("en-IN")}</span></div>
            )}
          </div>
          <div className="space-y-2">
            <Label>TDS Deducted by Client (₹)</Label>
            <Input type="number" value={form.tdsDeducted} onChange={(e) => setForm({ ...form, tdsDeducted: Number(e.target.value) })} />
            <Button size="sm" variant="outline" className="w-full" onClick={() => setForm({ ...form, tdsDeducted: tdsAuto })}>Auto: {tax.tdsRate}% of subtotal = ₹{tdsAuto.toLocaleString("en-IN")}</Button>
            <div className="text-xs text-muted-foreground">Tracks Form 26AS / TDS receivable</div>
          </div>
        </div>

        <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Payment terms, work scope, etc." /></div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>{editing ? "Save Changes" : "Create Invoice"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
