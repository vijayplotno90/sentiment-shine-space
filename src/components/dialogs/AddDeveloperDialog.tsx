import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDeveloper } from "@/data/store";
import { toast } from "sonner";

export const AddDeveloperDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", level: "Junior", experience: "1 year experience",
    skills: "", schedule: "Flexible", languages: "English",
    salary: 50000, hourlyRate: 500, status: "available" as "available" | "busy",
  });

  const save = () => {
    if (!form.name || !form.email) { toast.error("Name & email required"); return; }
    addDeveloper({
      ...form,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      salary: Number(form.salary), hourlyRate: Number(form.hourlyRate),
    });
    toast.success("Developer added");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Add New Developer</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Full Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div>
            <Label>Level</Label>
            <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Junior", "Mid", "Senior", "Lead", "Architect"].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Experience</Label><Input value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} /></div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as "available" | "busy" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2"><Label>Skills (comma separated)</Label><Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, Node, TypeScript" /></div>
          <div><Label>Availability / Schedule</Label><Input value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} /></div>
          <div><Label>Languages</Label><Input value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} /></div>
          <div><Label>Monthly Salary (₹)</Label><Input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })} /></div>
          <div><Label>Hourly Rate (₹)</Label><Input type="number" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: Number(e.target.value) })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Add Developer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
