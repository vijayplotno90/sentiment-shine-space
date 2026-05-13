import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateProfile, useProfile } from "@/data/store";
import { toast } from "sonner";

export const ProfileDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => {
  const profile = useProfile();
  const [form, setForm] = useState(profile);
  const save = () => { updateProfile(form); toast.success("Profile updated"); onOpenChange(false); };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Your Profile</DialogTitle></DialogHeader>
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground grid place-items-center text-2xl font-bold">
            {form.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
          </div>
        </div>
        <div className="space-y-3">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>Role</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
