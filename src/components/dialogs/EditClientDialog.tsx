import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateClient, type Client } from "@/data/store";
import { toast } from "sonner";

export const EditClientDialog = ({ client, open, onOpenChange }: { client: Client; open: boolean; onOpenChange: (o: boolean) => void }) => {
  const [form, setForm] = useState({ ...client, technologies: client.technologies.join(", ") });

  const save = () => {
    if (!form.name.trim() || !form.email.trim()) { toast.error("Name and email required"); return; }
    updateClient(client.id, {
      name: form.name, email: form.email, phone: form.phone, company: form.company,
      address: form.address, gstin: form.gstin,
      technologies: form.technologies.split(",").map((t) => t.trim()).filter(Boolean),
    });
    toast.success("Client updated");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Edit Client</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
          <div><Label>GSTIN</Label><Input value={form.gstin || ""} onChange={(e) => setForm({ ...form, gstin: e.target.value })} /></div>
          <div className="col-span-2"><Label>Address</Label><Input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
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
