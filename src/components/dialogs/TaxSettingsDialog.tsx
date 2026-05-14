import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateTaxSettings, useTaxSettings, type CompanyDetails } from "@/data/store";
import { STATE_CODES } from "@/lib/format";
import { toast } from "sonner";

export const TaxSettingsDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => {
  const tax = useTaxSettings();
  const [form, setForm] = useState(tax);
  const setCo = (patch: Partial<CompanyDetails>) => setForm({ ...form, company: { ...form.company, ...patch } });

  const save = () => { updateTaxSettings(form); toast.success("Tax & company settings saved"); onOpenChange(false); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Tax, Company & Bank Settings</DialogTitle></DialogHeader>
        <Tabs defaultValue="rates">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rates">Tax Rates</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="bank">Bank & UPI</TabsTrigger>
          </TabsList>
          <TabsContent value="rates" className="grid grid-cols-2 gap-3 pt-3">
            <div><Label>GST Rate (%)</Label><Input type="number" value={form.gstRate} onChange={(e) => setForm({ ...form, gstRate: Number(e.target.value) })} /></div>
            <div><Label>CGST Rate (%)</Label><Input type="number" value={form.cgstRate} onChange={(e) => setForm({ ...form, cgstRate: Number(e.target.value) })} /></div>
            <div><Label>SGST Rate (%)</Label><Input type="number" value={form.sgstRate} onChange={(e) => setForm({ ...form, sgstRate: Number(e.target.value) })} /></div>
            <div><Label>IGST Rate (%)</Label><Input type="number" value={form.igstRate} onChange={(e) => setForm({ ...form, igstRate: Number(e.target.value) })} /></div>
            <div><Label>TDS Rate (%) — 194J/194C default</Label><Input type="number" value={form.tdsRate} onChange={(e) => setForm({ ...form, tdsRate: Number(e.target.value) })} /></div>
          </TabsContent>
          <TabsContent value="company" className="grid grid-cols-2 gap-3 pt-3">
            <div className="col-span-2"><Label>Company Name</Label><Input value={form.company.name} onChange={(e) => setCo({ name: e.target.value })} /></div>
            <div><Label>GSTIN</Label><Input value={form.company.gstin} onChange={(e) => setCo({ gstin: e.target.value })} /></div>
            <div><Label>PAN</Label><Input value={form.company.pan} onChange={(e) => setCo({ pan: e.target.value })} /></div>
            <div>
              <Label>Home State</Label>
              <Select value={form.company.stateCode || ""} onValueChange={(v) => setCo({ stateCode: v })}>
                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>{STATE_CODES.map((s) => <SelectItem key={s.code} value={`${s.code}-${s.name}`}>{s.code} — {s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Business Type</Label>
              <Select value={form.company.businessType || ""} onValueChange={(v) => setCo({ businessType: v as CompanyDetails["businessType"] })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {["Proprietorship","Partnership","LLP","Private Limited","Public Limited"].map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Registered Address</Label><Input value={form.company.address} onChange={(e) => setCo({ address: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={form.company.email} onChange={(e) => setCo({ email: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.company.phone} onChange={(e) => setCo({ phone: e.target.value })} /></div>
            <div className="col-span-2"><Label>CA / Accountant Email</Label><Input type="email" value={form.company.caEmail} onChange={(e) => setCo({ caEmail: e.target.value })} /></div>
          </TabsContent>
          <TabsContent value="bank" className="grid grid-cols-2 gap-3 pt-3">
            <div className="col-span-2 text-xs text-muted-foreground">These appear on every invoice PDF so clients know where to pay.</div>
            <div><Label>Bank Name</Label><Input value={form.company.bankName || ""} onChange={(e) => setCo({ bankName: e.target.value })} /></div>
            <div><Label>Account Holder Name</Label><Input value={form.company.accountName || ""} onChange={(e) => setCo({ accountName: e.target.value })} /></div>
            <div><Label>Account Number</Label><Input value={form.company.accountNumber || ""} onChange={(e) => setCo({ accountNumber: e.target.value })} /></div>
            <div><Label>IFSC Code</Label><Input value={form.company.ifsc || ""} onChange={(e) => setCo({ ifsc: e.target.value })} /></div>
            <div><Label>Branch</Label><Input value={form.company.branch || ""} onChange={(e) => setCo({ branch: e.target.value })} /></div>
            <div><Label>UPI ID</Label><Input value={form.company.upiId || ""} onChange={(e) => setCo({ upiId: e.target.value })} placeholder="business@hdfc" /></div>
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
