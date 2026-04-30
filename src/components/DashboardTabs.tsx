import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const clients = [
  { initials: "AK", name: "Arun Krishnan", company: "TechCorp Solutions", tech: "Java Spring Boot", progress: 75, status: "active" },
  { initials: "MR", name: "Meera Reddy", company: "DataFlow Analytics", tech: "Tableau", progress: 60, status: "active" },
  { initials: "VS", name: "Vikram Shah", company: "CloudTech Systems", tech: "Databricks", progress: 40, status: "new" },
];

const developers = [
  { name: "Amit Sharma", skill: "Java / Spring", status: "Busy", clients: 3 },
  { name: "Neha Gupta", skill: "Tableau / Power BI", status: "Available", clients: 2 },
  { name: "Karan Mehta", skill: "Databricks", status: "Busy", clients: 1 },
];

const meetings = [
  { title: "Quarterly Review – TechCorp", when: "Tomorrow • 11:00 AM" },
  { title: "Onboarding – CloudTech", when: "Fri, May 1 • 3:00 PM" },
  { title: "Demo – DataFlow Analytics", when: "Mon, May 4 • 10:30 AM" },
];

const finance = [
  { label: "Revenue (April)", value: "₹2,45,000", tone: "text-emerald-600" },
  { label: "Pending Payments", value: "₹85,000", tone: "text-orange-600" },
  { label: "Expenses", value: "₹62,000", tone: "text-rose-600" },
  { label: "Net Profit", value: "₹98,000", tone: "text-primary" },
];

export const DashboardTabs = () => (
  <Tabs defaultValue="clients" className="w-full">
    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-card shadow-card rounded-xl p-1 h-auto">
      <TabsTrigger value="clients" className="py-2.5">Recent Clients</TabsTrigger>
      <TabsTrigger value="devs" className="py-2.5">Developer Status</TabsTrigger>
      <TabsTrigger value="meetings" className="py-2.5">Upcoming Meetings</TabsTrigger>
      <TabsTrigger value="finance" className="py-2.5">Financial Overview</TabsTrigger>
    </TabsList>

    <TabsContent value="clients" className="mt-4">
      <div className="bg-card rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-lg">Recent Client Activity</h3>
        <p className="text-sm text-muted-foreground mb-5">Latest clients and their progress</p>
        <ul className="space-y-3">
          {clients.map((c) => (
            <li key={c.name} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
              <div className="h-11 w-11 rounded-full bg-primary text-primary-foreground grid place-items-center font-semibold">
                {c.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.company}</div>
                <div className="text-xs text-primary font-medium mt-0.5">{c.tech}</div>
              </div>
              <div className="hidden sm:block w-40">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{c.progress}%</span>
                </div>
                <Progress value={c.progress} className="h-2" />
              </div>
              <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge>
            </li>
          ))}
        </ul>
      </div>
    </TabsContent>

    <TabsContent value="devs" className="mt-4">
      <div className="bg-card rounded-2xl shadow-card p-6 space-y-3">
        {developers.map((d) => (
          <div key={d.name} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
            <div>
              <div className="font-semibold">{d.name}</div>
              <div className="text-xs text-muted-foreground">{d.skill}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{d.clients} clients</span>
              <Badge variant={d.status === "Available" ? "default" : "secondary"}>{d.status}</Badge>
            </div>
          </div>
        ))}
      </div>
    </TabsContent>

    <TabsContent value="meetings" className="mt-4">
      <div className="bg-card rounded-2xl shadow-card p-6 space-y-3">
        {meetings.map((m) => (
          <div key={m.title} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
            <div className="font-semibold">{m.title}</div>
            <div className="text-sm text-muted-foreground">{m.when}</div>
          </div>
        ))}
      </div>
    </TabsContent>

    <TabsContent value="finance" className="mt-4">
      <div className="bg-card rounded-2xl shadow-card p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {finance.map((f) => (
          <div key={f.label} className="p-4 rounded-xl bg-secondary/50">
            <div className="text-xs text-muted-foreground">{f.label}</div>
            <div className={`text-2xl font-bold mt-1 ${f.tone}`}>{f.value}</div>
          </div>
        ))}
      </div>
    </TabsContent>
  </Tabs>
);
