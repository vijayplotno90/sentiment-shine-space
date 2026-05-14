import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateClient, type Client } from "@/data/store";
import { STATE_CODES } from "@/lib/format";
import { toast } from "sonner";

export const EditClientDialog = ({ client, open, onOpenChange }: { client: Client; open: boolean; onOpenChange: (o: boolean) => void }) => {
  const [form, setForm] = useState({ ...client, technologies: client.technologies.join(", ") });

  const save = () => {
    if (!form.name.trim() || !form.email.trim()) { toast.error("Name and email required"); return; }
    updateClient(client.id, {
      name: form.name, email: form.email, phone: form.phone, company: form.company,
      address: form.address, gstin: form.gstin, pan: form.pan, stateCode: form.stateCode,
      technologies: form.technologies.split(",").map((t) => t.trim()).filter(Boolean),
    });
    toast.success("Client updated");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Client</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
          <div>
            <Label>State (Place of Supply)</Label>
            <Select value={form.stateCode || ""} onValueChange={(v) => setForm({ ...form, stateCode: v })}>
              <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
              <SelectContent>{STATE_CODES.map((s) => <SelectItem key={s.code} value={`${s.code}-${s.name}`}>{s.code} — {s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>GSTIN</Label><Input value={form.gstin || ""} onChange={(e) => setForm({ ...form, gstin: e.target.value })} placeholder="29ABCDE1234F1Z5" /></div>
          <div><Label>PAN</Label><Input value={form.pan || ""} onChange={(e) => setForm({ ...form, pan: e.target.value })} placeholder="ABCDE1234F" /></div>
          <div className="col-span-2"><Label>Billing Address</Label><Input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div className="col-span-2"><Label>Technologies (comma separated)</Label><Input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
