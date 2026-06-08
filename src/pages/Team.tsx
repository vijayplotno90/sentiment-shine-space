import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, UserPlus, Shield, Mail, Clock } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import {
  fetchTeam, inviteMember, setMemberStatus, updateMemberRole, revokeInvitation,
  type Member, type Invitation, type Role,
} from "@/data/store";

const emailSchema = z.string().trim().email("Enter a valid email").max(255);

const roleBadge: Record<Role, { label: string; cls: string }> = {
  owner: { label: "Owner", cls: "bg-primary/10 text-primary border-primary/20" },
  admin: { label: "Admin", cls: "bg-accent/10 text-accent-foreground border-accent/20" },
  ca: { label: "CA (read-only)", cls: "bg-muted text-muted-foreground border-border" },
};

const Team = () => {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("admin");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<{ id: string; name: string } | null>(null);

  const reload = async () => {
    const { members, invitations } = await fetchTeam();
    setMembers(members);
    setInvites(invitations);
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  const handleInvite = async () => {
    const v = emailSchema.safeParse(email);
    if (!v.success) { toast.error(v.error.issues[0].message); return; }
    if (members.some((m) => m.email.toLowerCase() === v.data.toLowerCase() && m.status === "active")) {
      toast.error("That person is already an active member."); return;
    }
    setBusy(true);
    const { error } = await inviteMember(v.data, role);
    setBusy(false);
    if (error) { toast.error(error); return; }
    toast.success("Invitation sent. They'll join automatically when they sign up with this email.");
    setEmail("");
    reload();
  };

  const changeRole = async (m: Member, r: Role) => {
    const { error } = await updateMemberRole(m.id, r);
    if (error) { toast.error(error); return; }
    toast.success(`${m.name || m.email} is now ${roleBadge[r].label}`);
    reload();
  };

  const toggleStatus = async (m: Member) => {
    const next = m.status === "active" ? "inactive" : "active";
    const { error } = await setMemberStatus(m.id, next);
    if (error) { toast.error(error); return; }
    toast.success(next === "inactive" ? "Member deactivated — they can no longer log in." : "Member re-activated.");
    setConfirm(null);
    reload();
  };

  const revoke = async (i: Invitation) => {
    const { error } = await revokeInvitation(i.id);
    if (error) { toast.error(error); return; }
    toast.success("Invitation revoked");
    reload();
  };

  const active = members.filter((m) => m.status === "active");
  const inactive = members.filter((m) => m.status === "inactive");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team & Access"
        subtitle="Invite your staff, set what they can do, and remove access when someone leaves."
      />

      {/* Invite */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><UserPlus className="h-4 w-4" /> Invite a team member</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <Label htmlFor="invite-email">Their email</Label>
              <Input id="invite-email" type="email" placeholder="person@company.com" value={email}
                onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleInvite()} />
            </div>
            <div className="w-full sm:w-56">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin — view &amp; edit everything</SelectItem>
                  <SelectItem value="ca">CA — read-only, invoices only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleInvite} disabled={busy} className="sm:w-auto w-full">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Send invite
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            The invite links to the email. When they create an account with that exact email,
            they automatically join your workspace with the role you picked.
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <>
          {/* Active members */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" /> Active members ({active.length})</CardTitle></CardHeader>
            <CardContent className="divide-y divide-border">
              {active.map((m) => (
                <div key={m.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-bold">
                    {(m.name || m.email).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{m.name || m.email.split("@")[0]} {m.isYou && <span className="text-xs text-muted-foreground">(you)</span>}</div>
                    <div className="text-xs text-muted-foreground truncate">{m.email}</div>
                  </div>
                  {m.role === "owner" || m.isYou ? (
                    <Badge variant="outline" className={roleBadge[m.role].cls}>{roleBadge[m.role].label}</Badge>
                  ) : (
                    <Select value={m.role} onValueChange={(v) => changeRole(m, v as Role)}>
                      <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="ca">CA (read-only)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {m.role !== "owner" && !m.isYou && (
                    <Button variant="outline" size="sm" onClick={() => setConfirm({ id: m.id, name: m.name || m.email })}>
                      Deactivate
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending invites */}
          {invites.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4" /> Pending invitations ({invites.length})</CardTitle></CardHeader>
              <CardContent className="divide-y divide-border">
                {invites.map((i) => (
                  <div key={i.id} className="flex flex-wrap items-center gap-3 py-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{i.email}</div>
                      <div className="text-xs text-muted-foreground">Waiting for them to sign up</div>
                    </div>
                    <Badge variant="outline" className={roleBadge[i.role].cls}>{roleBadge[i.role].label}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => revoke(i)}>Revoke</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Inactive / former members */}
          {inactive.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base text-muted-foreground">Former members ({inactive.length})</CardTitle></CardHeader>
              <CardContent className="divide-y divide-border">
                {inactive.map((m) => (
                  <div key={m.id} className="flex flex-wrap items-center gap-3 py-3 opacity-80">
                    <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground grid place-items-center text-sm font-bold">
                      {(m.name || m.email).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{m.name || m.email.split("@")[0]}</div>
                      <div className="text-xs text-muted-foreground truncate">{m.email} · no access</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toggleStatus(m)}>Re-activate</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {confirm?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              They will immediately lose access and won't be able to log in. Their past data stays
              in your records. You can re-activate them anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { const m = members.find((x) => x.id === confirm?.id); if (m) toggleStatus(m); }}>
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Team;
