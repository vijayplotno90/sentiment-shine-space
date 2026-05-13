import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { resetAll } from "@/data/store";
import { toast } from "sonner";

export const SettingsDialog = ({ open, onOpenChange, onOpenTax }: { open: boolean; onOpenChange: (o: boolean) => void; onOpenTax: () => void }) => {
  const [notifications, setNotifications] = useState(true);
  const [emails, setEmails] = useState(true);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Settings</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between"><Label>In-app notifications</Label><Switch checked={notifications} onCheckedChange={setNotifications} /></div>
          <div className="flex items-center justify-between"><Label>Email reminders</Label><Switch checked={emails} onCheckedChange={setEmails} /></div>
          <Button variant="outline" className="w-full" onClick={() => { onOpenChange(false); onOpenTax(); }}>Tax & Company Settings</Button>
          <Button variant="destructive" className="w-full" onClick={() => { if (confirm("Reset all data to seed?")) { resetAll(); toast.success("Data reset"); onOpenChange(false); } }}>Reset Demo Data</Button>
        </div>
        <DialogFooter><Button onClick={() => onOpenChange(false)}>Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
