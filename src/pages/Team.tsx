import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getOrgId, isOwner, useOrgRole, type OrgRole } from "@/data/store";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, UserPlus, Shield, Trash2, Mail, Crown } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

type Member = { id: string; user_id: string; email: string | null; role: OrgRole; status: string };
type Invite = { id: string; email: string; role: OrgRole; status: string; created_at: string };

const ROLE_LABEL: Record<OrgRole, string> = { owner: "Owner", admin: "Admin", ca: "CA (read-only)" };
const ROLE_DESC: Record<OrgRole, string> = {
  owner: "Full control — manages the team and all data.",
  admin: "Can view and edit all data, but cannot manage the team.",
  ca: "Read-only. Sees only Billing, Finance & Reports.",
};
const emailSchema = z.string().trim().email("Enter a valid email").max(255);

const RoleBadge = ({ role }: { role: OrgRole }) => {
  const variant = role === "owner" ? "default" : role === "admin" ? "secondary" : "outline";
  return (
    <Badge variant={variant} className="gap-1">
      {role === "owner" && <Crown className="h-3 w-3" />}
      {role === "admin" && <Shield className="h-3 w-3" />}
      {ROLE_LABEL[role]}
    </Badge>
  );
};

const Team = () => {
  const role = useOrgRole();
  const owner = isOwner();
  const orgId = getOrgId();
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OrgRole>("ca");
  const [sending, setSending] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    setMe(auth?.user?.id ?? null);
    const [m, i] = await Promise.all([
      supabase.from("organization_members").select("id,user_id,email,role,status").order("created_at"),
      supabase.from("organization_invitations").select("id,email,role,status,created_at").eq("status", "pending").order("created_at"),
    ]);
    setMembers((m.data as Member[]) || []);
    setInvites((i.data as Invite[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const sendInvite = async () => {
    const parsed = emailSchema.safeParse(inviteEmail);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    if (!orgId) { toast.error("Organization not ready yet"); return; }
    const email = parsed.data.toLowerCase();
    if (members.some((mm) => mm.email?.toLowerCase() === email)) { toast.error("That person is already on your team"); return; }
    if (invites.some((iv) => iv.email.toLowerCase() === email)) { toast.error("An invitation is already pending for that email"); return; }

    setSending(true);
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("organization_invitations").insert({
      organization_id: orgId, email, role: inviteRole, invited_by: auth?.user?.id ?? null,
    });
    setSending(false);
    if (error) { toast.error("Could not send invite: " + error.message); return; }
    toast.success(`Invitation sent. ${email} joins automatically when they sign up with this email.`);
    setInviteEmail("");
    refresh();
  };

  const changeRole = async (m: Member, newRole: OrgRole) => {
    const { error } = await supabase.from("organization_members").update({ role: newRole }).eq("id", m.id);
    if (error) { toast.error("Could not update role: " + error.message); return; }
    toast.success(`${m.email || "Member"} is now ${ROLE_LABEL[newRole]}`);
    refresh();
  };

  const removeMember = async (m: Member) => {
    const { error } = await supabase.from("organization_members").delete().eq("id", m.id);
    if (error) { toast.error("Could not remove: " + error.message); return; }
    toast.success(`${m.email || "Member"} removed from the team`);
    refresh();
  };

  const cancelInvite = async (iv: Invite) => {
    const { error } = await supabase.from("organization_invitations").delete().eq("id", iv.id);
    if (error) { toast.error("Could not cancel: " + error.message); return; }
    toast.success("Invitation cancelled");
    refresh();
  };

  if (role && !owner) {
    return (
      <div className="space-y-6">
        <PageHeader title="Team" subtitle="Manage who can access your workspace" />
        <Card className="p-8 text-center text-muted-foreground">
          Only the owner can manage team members.
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Team & Access" subtitle="Add employees, set what they can do, and remove people who leave." />

      {/* Invite */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 font-semibold"><UserPlus className="h-4 w-4" /> Invite a team member</div>
        <div className="grid gap-3 sm:grid-cols-[1fr_200px_auto] sm:items-end">
          <div>
            <Label htmlFor="inv-email">Work email</Label>
            <Input id="inv-email" type="email" placeholder="person@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
          </div>
          <div>
            <Label>Role</Label>
            <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as OrgRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin — full edit access</SelectItem>
                <SelectItem value="ca">CA — read-only, tax only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={sendInvite} disabled={sending}>
            {sending && <Loader2 className="h-4 w-4 animate-spin" />} Send invite
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{ROLE_DESC[inviteRole]} They join your workspace the moment they create an account with this email.</p>
      </Card>

      {loading ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <>
          {/* Members */}
          <Card className="p-6 space-y-4">
            <div className="font-semibold">Members ({members.length})</div>
            <div className="divide-y divide-border">
              {members.map((m) => {
                const isSelf = m.user_id === me;
                return (
                  <div key={m.id} className="flex flex-wrap items-center gap-3 py-3">
                    <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-bold">
                      {(m.email || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{m.email || "Unknown"}{isSelf && <span className="text-muted-foreground"> (you)</span>}</div>
                      <div className="text-xs text-muted-foreground">{ROLE_DESC[m.role]}</div>
                    </div>
                    {m.role === "owner" ? (
                      <RoleBadge role={m.role} />
                    ) : (
                      <>
                        <Select value={m.role} onValueChange={(v) => changeRole(m, v as OrgRole)}>
                          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="ca">CA (read-only)</SelectItem>
                          </SelectContent>
                        </Select>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove {m.email}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                They will immediately lose all access to this workspace. You can always invite them again later.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeMember(m)}>Remove</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Pending invitations */}
          {invites.length > 0 && (
            <Card className="p-6 space-y-4">
              <div className="font-semibold">Pending invitations ({invites.length})</div>
              <div className="divide-y divide-border">
                {invites.map((iv) => (
                  <div key={iv.id} className="flex flex-wrap items-center gap-3 py-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{iv.email}</div>
                      <div className="text-xs text-muted-foreground">Waiting for sign-up</div>
                    </div>
                    <RoleBadge role={iv.role} />
                    <Button variant="ghost" size="sm" onClick={() => cancelInvite(iv)}>Cancel</Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Team;
