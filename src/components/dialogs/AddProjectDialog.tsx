import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addProject, useDevelopers } from "@/data/store";
import { today } from "@/lib/format";
import { toast } from "sonner";

export const AddProjectDialog = ({ clientId, open, onOpenChange }: { clientId: string; open: boolean; onOpenChange: (o: boolean) => void }) => {
  const developers = useDevelopers();
  const [form, setForm] = useState({ name: "", technology: "", assignedDeveloperId: developers[0]?.id || "", startDate: today(), notes: "" });

  const save = () => {
    if (!form.name || !form.assignedDeveloperId) { toast.error("Name & developer required"); return; }
    addProject({ ...form, clientId, status: "active", satisfactionRating: 0 });
    toast.success("Project added & developer assigned");
    onOpenChange(false);
    setForm({ name: "", technology: "", assignedDeveloperId: developers[0]?.id || "", startDate: today(), notes: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Add Project</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label>Project Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Technology</Label><Input value={form.technology} onChange={(e) => setForm({ ...form, technology: e.target.value })} placeholder="e.g. Java, Spring Boot" /></div>
          <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
          <div className="col-span-2">
            <Label>Assign Developer *</Label>
            <Select value={form.assignedDeveloperId} onValueChange={(v) => setForm({ ...form, assignedDeveloperId: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {developers.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} — {d.level}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Create Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
