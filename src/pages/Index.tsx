import { AppSidebar } from "@/components/AppSidebar";
import { StatCard } from "@/components/StatCard";
import { PriorityTasks } from "@/components/PriorityTasks";
import { DashboardTabs } from "@/components/DashboardTabs";
import { QuickActions } from "@/components/QuickActions";
import { CheckCircle2 } from "lucide-react";

const Index = () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="flex min-h-screen">
      <AppSidebar />

      <main className="flex-1 min-w-0 p-4 md:p-8 space-y-6">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {greeting}! <span className="inline-block">👋</span>
            </h1>
            <p className="text-muted-foreground mt-1">{dateStr}</p>
            <p className="text-muted-foreground text-sm">Current Time: {timeStr}</p>
          </div>
          <div className="bg-card rounded-2xl shadow-card px-5 py-4 max-w-sm">
            <div className="font-bold">IT Consultancy Platform</div>
            <div className="text-sm text-muted-foreground">Business Management Dashboard</div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Database: Fully Functional
            </div>
          </div>
        </header>

        {/* Stat cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard value="24" label="Active Clients" variant="blue" />
          <StatCard value="8" label="Active Developers" variant="green" />
          <StatCard value="₹2,45,000" label="Monthly Revenue" variant="purple" />
          <StatCard value="₹85,000" label="Pending Payments" variant="orange" />
        </section>

        <PriorityTasks />
        <DashboardTabs />
        <QuickActions />

        <section className="bg-card rounded-2xl shadow-card p-6 text-center">
          <h3 className="font-bold">Database System Active</h3>
          <p className="text-sm text-muted-foreground mt-1">
            ✅ Full CRUD operations enabled • ✅ Data persistence active • ✅ Real-time updates working
          </p>
        </section>
      </main>
    </div>
  );
};

export default Index;
