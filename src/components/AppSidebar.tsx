import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Users, Code2, Calendar, Wallet, FileText, Settings, HelpCircle, BarChart3, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile, useRole, type Role } from "@/data/store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProfileDialog } from "@/components/dialogs/ProfileDialog";
import { SettingsDialog } from "@/components/dialogs/SettingsDialog";
import { HelpDialog } from "@/components/dialogs/HelpDialog";
import { TaxSettingsDialog } from "@/components/dialogs/TaxSettingsDialog";

type NavItem = { to: string; label: string; icon: typeof Home; end?: boolean; roles?: Role[] };

const nav: NavItem[] = [
  { to: "/", label: "Dashboard", icon: Home, end: true, roles: ["owner", "admin"] },
  { to: "/clients", label: "Clients", icon: Users, roles: ["owner", "admin"] },
  { to: "/developers", label: "Developers", icon: Code2, roles: ["owner", "admin"] },
  { to: "/meetings", label: "Meetings", icon: Calendar, roles: ["owner", "admin"] },
  { to: "/billing", label: "Billing", icon: FileText, roles: ["owner", "admin", "ca"] },
  { to: "/finance", label: "Finance", icon: Wallet, roles: ["owner", "admin"] },
  { to: "/reports", label: "Reports", icon: BarChart3, roles: ["owner", "admin"] },
  { to: "/team", label: "Team", icon: Shield, roles: ["owner"] },
];

const roleLabel: Record<Role, string> = { owner: "Owner", admin: "Admin", ca: "CA (read-only)" };

export const AppSidebar = () => {
  const navigate = useNavigate();
  const profile = useProfile();
  const role = useRole();
  const visibleNav = nav.filter((item) => !item.roles || (role && item.roles.includes(role)));
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [taxOpen, setTaxOpen] = useState(false);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/auth", { replace: true });
  };


  const FooterBtn = ({ icon: Icon, label, onClick }: { icon: typeof Settings; label: string; onClick: () => void }) => (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50">
      <Icon className="h-4 w-4" />{label}
    </button>
  );

  return (
    <>
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col bg-sidebar border-r border-sidebar-border h-screen sticky top-0">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="h-11 w-11 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold shadow-stat">IT</div>
          <div>
            <div className="font-bold text-lg leading-tight">Consultancy</div>
            <div className="text-xs text-muted-foreground">Management Platform</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.end}
                className={({ isActive }) => cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50")}>
                <Icon className="h-5 w-5" />{item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-sidebar-border">
          <button onClick={() => setProfileOpen(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent/50 mb-2">
            <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-bold">{profile.initials}</div>
            <div className="text-left flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{profile.name}</div>
              <div className="text-xs text-muted-foreground truncate">{profile.role}</div>
            </div>
          </button>
          <FooterBtn icon={Settings} label="Settings" onClick={() => setSettingsOpen(true)} />
          <FooterBtn icon={HelpCircle} label="Help & Support" onClick={() => setHelpOpen(true)} />
          <FooterBtn icon={LogOut} label="Sign Out" onClick={handleLogout} />
        </div>
      </aside>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} onOpenTax={() => setTaxOpen(true)} />
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
      <TaxSettingsDialog open={taxOpen} onOpenChange={setTaxOpen} />
    </>
  );
};
