import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateTaxSettings, useTaxSettings } from "@/data/store";
import { toast } from "sonner";

export const TaxSettingsDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => {
  const tax = useTaxSettings();
  const [form, setForm] = useState(tax);

  const save = () => {
    updateTaxSettings(form);
    toast.success("Tax settings saved");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Tax & Company Settings</DialogTitle></DialogHeader>
        <Tabs defaultValue="rates">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rates">Tax Rates</TabsTrigger>
            <TabsTrigger value="company">Company Info</TabsTrigger>
          </TabsList>
          <TabsContent value="rates" className="grid grid-cols-2 gap-3 pt-3">
            <div><Label>GST Rate (%)</Label><Input type="number" value={form.gstRate} onChange={(e) => setForm({ ...form, gstRate: Number(e.target.value) })} /></div>
            <div><Label>CGST Rate (%)</Label><Input type="number" value={form.cgstRate} onChange={(e) => setForm({ ...form, cgstRate: Number(e.target.value) })} /></div>
            <div><Label>SGST Rate (%)</Label><Input type="number" value={form.sgstRate} onChange={(e) => setForm({ ...form, sgstRate: Number(e.target.value) })} /></div>
            <div><Label>IGST Rate (%)</Label><Input type="number" value={form.igstRate} onChange={(e) => setForm({ ...form, igstRate: Number(e.target.value) })} /></div>
            <div><Label>TDS Rate (%)</Label><Input type="number" value={form.tdsRate} onChange={(e) => setForm({ ...form, tdsRate: Number(e.target.value) })} /></div>
          </TabsContent>
          <TabsContent value="company" className="grid grid-cols-2 gap-3 pt-3">
            <div className="col-span-2"><Label>Company Name</Label><Input value={form.company.name} onChange={(e) => setForm({ ...form, company: { ...form.company, name: e.target.value } })} /></div>
            <div><Label>GSTIN</Label><Input value={form.company.gstin} onChange={(e) => setForm({ ...form, company: { ...form.company, gstin: e.target.value } })} /></div>
            <div><Label>PAN</Label><Input value={form.company.pan} onChange={(e) => setForm({ ...form, company: { ...form.company, pan: e.target.value } })} /></div>
            <div className="col-span-2"><Label>Address</Label><Input value={form.company.address} onChange={(e) => setForm({ ...form, company: { ...form.company, address: e.target.value } })} /></div>
            <div><Label>Email</Label><Input value={form.company.email} onChange={(e) => setForm({ ...form, company: { ...form.company, email: e.target.value } })} /></div>
            <div><Label>Phone</Label><Input value={form.company.phone} onChange={(e) => setForm({ ...form, company: { ...form.company, phone: e.target.value } })} /></div>
            <div className="col-span-2"><Label>CA / Accountant Email</Label><Input type="email" value={form.company.caEmail} onChange={(e) => setForm({ ...form, company: { ...form.company, caEmail: e.target.value } })} /></div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
