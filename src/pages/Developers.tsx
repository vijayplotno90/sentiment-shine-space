import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Mail, Phone, Star, Plus } from "lucide-react";
import { useDevelopers, useProjects, useClients, useInvoices } from "@/data/store";
import { AddDeveloperDialog } from "@/components/dialogs/AddDeveloperDialog";
import { inr } from "@/lib/format";

const Developers = () => {
  const developers = useDevelopers();
  const projects = useProjects();
  const clients = useClients();
  const invoices = useInvoices();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(
    () => developers.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))),
    [developers, search]
  );

  const totals = {
    total: developers.length,
    available: developers.filter((d) => d.status === "available").length,
    util: developers.length ? Math.round(developers.reduce((s, d) => s + d.utilization, 0) / developers.length) : 0,
    rating: developers.length ? (developers.reduce((s, d) => s + d.rating, 0) / developers.length).toFixed(1) : "0",
  };

  return (
    <>
      <PageHeader
        title="Developer Management"
        subtitle="Track team performance, current workload, and earnings"
        action={<Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" />Add New Developer</Button>}
      />

      <section className="bg-card rounded-2xl shadow-card p-4">
        <Input placeholder="Search developers by name or skills..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard value={String(totals.total)} label="Total Developers" variant="blue" />
        <StatCard value={String(totals.available)} label="Available Now" variant="green" />
        <StatCard value={`${totals.util}%`} label="Avg Utilization" variant="orange" />
        <StatCard value={String(totals.rating)} label="Avg Rating" variant="purple" />
      </section>

      <Tabs defaultValue="list">
        <TabsList className="grid w-full grid-cols-5 bg-card shadow-card rounded-xl p-1 h-auto">
          <TabsTrigger value="list" className="py-2.5">Developer List</TabsTrigger>
          <TabsTrigger value="current" className="py-2.5">Current Workload</TabsTrigger>
          <TabsTrigger value="performance" className="py-2.5">Performance</TabsTrigger>
          <TabsTrigger value="salary" className="py-2.5">Salary</TabsTrigger>
          <TabsTrigger value="earnings" className="py-2.5">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4 space-y-4">
          {filtered.map((d) => (
            <div key={d.id} className="bg-card rounded-2xl shadow-card p-6">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                <div className="flex gap-4 flex-1">
                  <div className="h-14 w-14 rounded-full bg-primary/10 text-primary grid place-items-center font-bold text-lg shrink-0">{d.initials}</div>
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
                      {d.skills.map((s) => <Badge key={s} variant="secondary" className="bg-primary/10 text-primary border-0">{s}</Badge>)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-3">Schedule: {d.schedule} • Languages: {d.languages}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:w-[420px]">
                  <Stat label="Active Clients" value={String(d.activeClients)} tone="text-foreground" />
                  <Stat label="Utilization" value={`${d.utilization}%`} tone="text-orange-600" />
                  <Stat label="Rating" value={`★ ${d.rating}`} tone="text-amber-500" />
                  <Stat label="Earnings" value={inr(d.monthlyEarnings)} tone="text-emerald-600" />
                </div>
              </div>

              {d.feedback.length > 0 && (
                <div className="mt-4">
                  <div className="font-semibold text-sm mb-2">Recent Client Feedback:</div>
                  <ul className="space-y-2">
                    {d.feedback.map((f, i) => (
                      <li key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/40">
                        <div><div className="font-medium text-sm">{f.client}</div><div className="text-xs text-muted-foreground italic">"{f.comment}"</div></div>
                        <div className="flex">{Array.from({ length: f.stars }).map((_, j) => <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="current" className="mt-4 space-y-4">
          {developers.map((d) => {
            const myProjects = projects.filter((p) => p.assignedDeveloperId === d.id && p.status === "active");
            return (
              <div key={d.id} className="bg-card rounded-2xl shadow-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary grid place-items-center font-bold">{d.initials}</div>
                  <div className="flex-1"><div className="font-semibold">{d.name}</div><div className="text-xs text-muted-foreground">Salary {inr(d.salary)}/mo • Hourly {inr(d.hourlyRate || 0)}</div></div>
                  <Badge>{myProjects.length} active</Badge>
                </div>
                {myProjects.length === 0 && <div className="text-sm text-muted-foreground">No active projects.</div>}
                <ul className="space-y-2">
                  {myProjects.map((p) => {
                    const c = clients.find((cl) => cl.id === p.clientId);
                    return (
                      <li key={p.id} className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-secondary/50 text-sm">
                        <div className="flex-1 min-w-[200px]"><div className="font-medium">{p.name}</div><div className="text-xs text-muted-foreground">{p.technology}</div></div>
                        <div className="text-xs">Client: <span className="text-primary font-medium">{c?.name}</span> ({c?.company})</div>
                        <div className="text-xs text-muted-foreground">Since {p.startDate}</div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <div className="bg-card rounded-2xl shadow-card p-6 space-y-4">
            {developers.map((d) => (
              <div key={d.id} className="space-y-2">
                <div className="flex justify-between text-sm"><span className="font-semibold">{d.name}</span><span className="text-muted-foreground">Knowledge {d.knowledgeScore}/10 • On-time {d.onTimeRate}%</span></div>
                <Progress value={d.knowledgeScore * 10} className="h-2" />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="salary" className="mt-4">
          <div className="bg-card rounded-2xl shadow-card p-6 space-y-3">
            {developers.map((d) => (
              <div key={d.id} className="flex justify-between items-center p-4 rounded-xl bg-secondary/50">
                <div><div className="font-semibold">{d.name}</div><div className="text-xs text-muted-foreground">{d.level} • {d.activeClients} clients</div></div>
                <div className="text-right"><div className="text-lg font-bold">{inr(d.salary)}/mo</div><div className="text-xs text-muted-foreground">Hourly {inr(d.hourlyRate || 0)}</div></div>
              </div>
            ))}
            <div className="flex justify-between p-4 rounded-xl bg-primary/10 mt-4">
              <span className="font-semibold">Total monthly payroll</span>
              <span className="font-bold text-primary">{inr(developers.reduce((s, d) => s + d.salary, 0))}</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="earnings" className="mt-4">
          <div className="bg-card rounded-2xl shadow-card p-6 space-y-3">
            {developers.map((d) => {
              const myProjectIds = projects.filter((p) => p.assignedDeveloperId === d.id).map((p) => p.id);
              const earned = invoices.filter((i) => i.projectId && myProjectIds.includes(i.projectId) && i.status === "paid").reduce((s, i) => s + i.subtotal, 0);
              return (
                <div key={d.id} className="flex justify-between items-center p-4 rounded-xl bg-secondary/50">
                  <div><div className="font-semibold">{d.name}</div><div className="text-xs text-muted-foreground">{d.level}</div></div>
                  <div className="text-right"><div className="text-emerald-600 font-bold text-lg">{inr(earned)}</div><div className="text-xs text-muted-foreground">From paid invoices</div></div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <AddDeveloperDialog open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
};

const Stat = ({ label, value, tone }: { label: string; value: string; tone: string }) => (
  <div><div className="text-xs text-muted-foreground">{label}</div><div className={`font-bold text-lg ${tone}`}>{value}</div></div>
);

export default Developers;
