import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addMeeting, updateMeeting, useClients, useDevelopers, useProjects, type Meeting } from "@/data/store";
import { today } from "@/lib/format";
import { toast } from "sonner";

export const ScheduleMeetingDialog = ({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing?: Meeting }) => {
  const clients = useClients();
  const developers = useDevelopers();
  const projects = useProjects();
  const [form, setForm] = useState(() => editing ?? {
    title: "", clientId: clients[0]?.id || "", developerId: developers[0]?.id || "",
    projectId: undefined as string | undefined,
    date: today(), time: "10:00 AM", duration: 60,
    status: "scheduled" as const, priority: "medium" as const, agenda: "", zoom: true,
  });

  const projectsForClient = useMemo(() => projects.filter((p) => p.clientId === form.clientId), [projects, form.clientId]);

  const save = () => {
    if (!form.title || !form.clientId || !form.developerId) { toast.error("Title, client & developer required"); return; }
    if (editing) {
      updateMeeting(editing.id, form as Partial<Meeting>);
      toast.success("Meeting updated");
    } else {
      addMeeting(form);
      toast.success("Meeting scheduled");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{editing ? "Edit Meeting" : "Schedule Meeting"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div>
            <Label>Client *</Label>
            <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v, projectId: undefined })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Developer *</Label>
            <Select value={form.developerId} onValueChange={(v) => setForm({ ...form, developerId: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{developers.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label>Project</Label>
            <Select value={form.projectId || "none"} onValueChange={(v) => setForm({ ...form, projectId: v === "none" ? undefined : v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {projectsForClient.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div><Label>Time</Label><Input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="10:00 AM" /></div>
          <div><Label>Duration (min)</Label><Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} /></div>
          <div>
            <Label>Priority</Label>
            <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as "low" | "medium" | "high" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2"><Label>Agenda</Label><Textarea value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>{editing ? "Save Changes" : "Schedule"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
