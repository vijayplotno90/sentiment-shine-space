import { NavLink } from "react-router-dom";
import { Home, Users, Code2, Calendar, Wallet, Settings, HelpCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: Home, end: true },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/developers", label: "Developers", icon: Code2 },
  { to: "/meetings", label: "Meetings", icon: Calendar },
  { to: "/finance", label: "Finance", icon: Wallet },
];

const footer = [
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/help", label: "Help & Support", icon: HelpCircle },
  { to: "/profile", label: "Profile", icon: User },
];

export const AppSidebar = () => (
  <aside className="hidden md:flex md:w-64 lg:w-72 flex-col bg-sidebar border-r border-sidebar-border h-screen sticky top-0">
    <div className="flex items-center gap-3 px-6 py-6">
      <div className="h-11 w-11 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold shadow-stat">
        IT
      </div>
      <div>
        <div className="font-bold text-lg leading-tight">Consultancy</div>
        <div className="text-xs text-muted-foreground">Management Platform</div>
      </div>
    </div>

    <nav className="flex-1 px-3 py-2 space-y-1">
      {nav.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )
            }
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>

    <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
      {footer.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )
            }
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        );
      })}
    </div>
  </aside>
);
