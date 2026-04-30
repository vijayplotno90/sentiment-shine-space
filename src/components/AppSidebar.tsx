import { Home, Users, Code2, Calendar, Wallet, Settings, HelpCircle, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "clients", label: "Clients", icon: Users },
  { id: "developers", label: "Developers", icon: Code2 },
  { id: "meetings", label: "Meetings", icon: Calendar },
  { id: "finance", label: "Finance", icon: Wallet },
];

const footer = [
  { id: "settings", label: "Settings", icon: Settings },
  { id: "help", label: "Help & Support", icon: HelpCircle },
  { id: "profile", label: "Profile", icon: User },
];

export const AppSidebar = () => {
  const [active, setActive] = useState("dashboard");
  return (
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
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        {footer.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
