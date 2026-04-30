import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Mail, Phone, Star, Plus } from "lucide-react";
import { useDevelopers } from "@/data/store";
import { toast } from "sonner";

const Developers = () => {
  const developers = useDevelopers();
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      developers.filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
      ),
    [developers, search]
  );

  const totals = {
    total: developers.length,
    available: developers.filter((d) => d.status === "available").length,
    util: Math.round(developers.reduce((s, d) => s + d.utilization, 0) / developers.length),
    rating: (developers.reduce((s, d) => s + d.rating, 0) / developers.length).toFixed(1),
  };

  return (
    <>
      <PageHeader
        title="Developer Management"
        subtitle="Manage your team and track their performance"
        action={
          <Button onClick={() => toast.info("Coming soon")}>
            <Plus className="h-4 w-4" />
            Add New Developer
          </Button>
        }
      />

      <section className="bg-card rounded-2xl shadow-card p-4">
        <Input
          placeholder="Search developers by name or skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard value={String(totals.total)} label="Total Developers" variant="blue" />
        <StatCard value={String(totals.available)} label="Available Now" variant="green" />
        <StatCard value={`${totals.util}%`} label="Avg Utilization" variant="orange" />
        <StatCard value={String(totals.rating)} label="Avg Rating" variant="purple" />
      </section>

      <Tabs defaultValue="list">
        <TabsList className="grid w-full grid-cols-4 bg-card shadow-card rounded-xl p-1 h-auto">
          <TabsTrigger value="list" className="py-2.5">Developer List</TabsTrigger>
          <TabsTrigger value="performance" className="py-2.5">Performance</TabsTrigger>
          <TabsTrigger value="workload" className="py-2.5">Workload</TabsTrigger>
          <TabsTrigger value="earnings" className="py-2.5">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4 space-y-4">
          {filtered.map((d) => (
            <div key={d.id} className="bg-card rounded-2xl shadow-card p-6">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                <div className="flex gap-4 flex-1">
                  <div className="h-14 w-14 rounded-full bg-primary/10 text-primary grid place-items-center font-bold text-lg shrink-0">
                    {d.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-lg">{d.name}</h3>
                      <Badge variant={d.status === "available" ? "default" : "secondary"}>{d.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{d.level} • {d.experience}</div>
                    <div className="flex gap-4 mt-2 text-sm flex-wrap">
                      <span className="flex items-center gap-1 text-muted-foreground"><Mail className="h-4 w-4" />{d.email}</span>
                      <span className="flex items-center gap-1 text-muted-foreground"><Phone className="h-4 w-4" />{d.phone}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {d.skills.map((s) => (
                        <Badge key={s} variant="secondary" className="bg-primary/10 text-primary border-0">{s}</Badge>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground mt-3">
                      Schedule: {d.schedule} • Languages: {d.languages}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:w-[420px]">
                  <Stat label="Active Clients" value={String(d.activeClients)} tone="text-foreground" />
                  <Stat label="Utilization" value={`${d.utilization}%`} tone="text-orange-600" />
                  <Stat label="Rating" value={`★ ${d.rating}`} tone="text-amber-500" />
                  <Stat label="Monthly Earnings" value={`₹${d.monthlyEarnings.toLocaleString("en-IN")}`} tone="text-emerald-600" />
                  <div className="col-span-2 lg:col-span-4 flex gap-2 justify-end">
                    <Button size="sm" variant="outline">View Profile</Button>
                    <Button size="sm" variant="outline">Assign Client</Button>
                    <Button size="sm">Contact</Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 rounded-xl bg-secondary/50">
                <Stat label="On-Time Rate" value={`${d.onTimeRate}%`} tone="text-emerald-600" />
                <Stat label="Response Time" value={d.responseTime} tone="text-foreground" />
                <Stat label="Knowledge Score" value={`${d.knowledgeScore}/10`} tone="text-primary" />
                <Stat label="Communication" value={`${d.communication}/10`} tone="text-purple-600" />
              </div>

              {d.feedback.length > 0 && (
                <div className="mt-4">
                  <div className="font-semibold text-sm mb-2">Recent Client Feedback:</div>
                  <ul className="space-y-2">
                    {d.feedback.map((f, i) => (
                      <li key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/40">
                        <div>
                          <div className="font-medium text-sm">{f.client}</div>
                          <div className="text-xs text-muted-foreground italic">"{f.comment}"</div>
                        </div>
                        <div className="flex">
                          {Array.from({ length: f.stars }).map((_, j) => (
                            <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <div className="bg-card rounded-2xl shadow-card p-6 space-y-4">
            {developers.map((d) => (
              <div key={d.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{d.name}</span>
                  <span className="text-muted-foreground">Knowledge {d.knowledgeScore}/10</span>
                </div>
                <Progress value={d.knowledgeScore * 10} className="h-2" />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workload" className="mt-4">
          <div className="bg-card rounded-2xl shadow-card p-6 space-y-4">
            {developers.map((d) => (
              <div key={d.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{d.name}</span>
                  <span className="text-muted-foreground">{d.utilization}% utilized • {d.activeClients} clients</span>
                </div>
                <Progress value={d.utilization} className="h-2" />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="earnings" className="mt-4">
          <div className="bg-card rounded-2xl shadow-card p-6 space-y-3">
            {developers.map((d) => (
              <div key={d.id} className="flex justify-between items-center p-4 rounded-xl bg-secondary/50">
                <div>
                  <div className="font-semibold">{d.name}</div>
                  <div className="text-xs text-muted-foreground">{d.level}</div>
                </div>
                <div className="text-emerald-600 font-bold text-lg">
                  ₹{d.monthlyEarnings.toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

const Stat = ({ label, value, tone }: { label: string; value: string; tone: string }) => (
  <div>
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className={`font-bold text-lg ${tone}`}>{value}</div>
  </div>
);

export default Developers;
