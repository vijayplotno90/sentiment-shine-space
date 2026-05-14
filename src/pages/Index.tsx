import { useMemo } from "react";
import { Link } from "react-router-dom";
import { StatCard } from "@/components/StatCard";
import { CheckCircle2, AlertTriangle, ArrowRight, Calendar, TrendingUp } from "lucide-react";
import { useClients, useDevelopers, useInvoices, useExpenses, useMeetings, useProjects } from "@/data/store";
import { inr, agingBuckets } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const clients = useClients();
  const developers = useDevelopers();
  const invoices = useInvoices();
  const expenses = useExpenses();
  const meetings = useMeetings();
  const projects = useProjects();

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  // current month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  const monthInvoices = invoices.filter((i) => i.issueDate >= monthStart && i.issueDate <= monthEnd);
  const monthRevenue = monthInvoices.reduce((s, i) => s + i.subtotal, 0);
  const pending = invoices.filter((i) => i.status !== "paid" && i.status !== "draft").reduce((s, i) => s + (i.total - (i.tdsDeducted || 0)), 0);

  const aging = useMemo(() => agingBuckets(invoices), [invoices]);
  const overdueInvoices = invoices.filter((i) => {
    if (i.status === "paid" || i.status === "draft") return false;
    return new Date(i.dueDate) < now;
  }).sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  // top clients by revenue (paid + sent)
  const topClients = useMemo(() => {
    const map = new Map<string, number>();
    invoices.forEach((i) => map.set(i.clientId, (map.get(i.clientId) || 0) + i.total));
    return Array.from(map.entries())
      .map(([id, total]) => ({ client: clients.find((c) => c.id === id), total }))
      .filter((x) => x.client)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [invoices, clients]);

  // upcoming meetings (next 7 days)
  const todayStr = now.toISOString().slice(0, 10);
  const upcoming = meetings
    .filter((m) => m.status === "scheduled" && m.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  // project profitability snapshot
  const profitability = useMemo(() => projects.map((p) => {
    const dev = developers.find((d) => d.id === p.assignedDeveloperId);
    const projInvoices = invoices.filter((i) => i.projectId === p.id);
    const revenue = projInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.subtotal, 0);
    return { project: p, client: clients.find((c) => c.id === p.clientId), developer: dev, revenue };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5), [projects, developers, invoices, clients]);

  return (
    <>
      <header className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{greeting}! <span className="inline-block">👋</span></h1>
          <p className="text-muted-foreground mt-1">{dateStr}</p>
          <p className="text-muted-foreground text-sm">Current Time: {timeStr}</p>
        </div>
        <div className="bg-card rounded-2xl shadow-card px-5 py-4 max-w-sm">
          <div className="font-bold">IT Consultancy Platform</div>
          <div className="text-sm text-muted-foreground">Business Management Dashboard</div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium"><CheckCircle2 className="h-4 w-4" />Live data — {invoices.length} invoices, {expenses.length} expenses</div>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard value={String(clients.filter((c) => c.status === "active").length)} label="Active Clients" variant="blue" />
        <StatCard value={String(developers.length)} label="Active Developers" variant="green" />
        <StatCard value={inr(monthRevenue)} label="This Month Revenue" variant="purple" />
        <StatCard value={inr(pending)} label="Outstanding (Net)" variant="orange" />
      </section>

      {overdueInvoices.length > 0 && (
        <section className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-2xl p-5">
          <div className="flex items-center gap-2 font-semibold text-rose-700 dark:text-rose-300"><AlertTriangle className="h-5 w-5" />{overdueInvoices.length} overdue invoice(s) — chase payment</div>
          <ul className="mt-3 space-y-2 text-sm">
            {overdueInvoices.slice(0, 5).map((i) => {
              const c = clients.find((cl) => cl.id === i.clientId);
              const days = Math.floor((now.getTime() - new Date(i.dueDate).getTime()) / 86400000);
              return (
                <li key={i.id} className="flex items-center justify-between bg-card rounded-lg p-3">
                  <div><span className="font-semibold">{i.number}</span> — {c?.name} ({c?.company})</div>
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive">{days}d overdue</Badge>
                    <span className="font-bold text-rose-600">{inr(i.total - (i.tdsDeducted || 0))}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Receivables Aging</h3>
            <Link to="/reports"><Button size="sm" variant="ghost">Reports <ArrowRight className="h-3.5 w-3.5" /></Button></Link>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {[
              { label: "Current", val: aging.current, tone: "bg-emerald-100 text-emerald-700" },
              { label: "1–30d", val: aging.d30, tone: "bg-amber-100 text-amber-700" },
              { label: "31–60d", val: aging.d60, tone: "bg-orange-100 text-orange-700" },
              { label: "61–90d", val: aging.d90, tone: "bg-rose-100 text-rose-700" },
              { label: "90+d", val: aging.d90Plus, tone: "bg-rose-200 text-rose-900" },
            ].map((b) => (
              <div key={b.label} className={`p-3 rounded-lg ${b.tone}`}>
                <div className="font-bold text-sm">{inr(b.val)}</div>
                <div className="opacity-80">{b.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-card p-5">
          <h3 className="font-bold mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Top Clients by Billing</h3>
          <ul className="space-y-2">
            {topClients.length === 0 && <li className="text-sm text-muted-foreground">No invoices yet.</li>}
            {topClients.map(({ client, total }) => (
              <li key={client!.id} className="flex justify-between items-center p-2.5 rounded-lg bg-secondary/50">
                <div><div className="font-medium text-sm">{client!.name}</div><div className="text-xs text-muted-foreground">{client!.company}</div></div>
                <div className="font-bold text-emerald-600">{inr(total)}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card rounded-2xl shadow-card p-5">
          <h3 className="font-bold mb-3 flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />Upcoming Meetings (next)</h3>
          <ul className="space-y-2">
            {upcoming.length === 0 && <li className="text-sm text-muted-foreground">No upcoming meetings scheduled.</li>}
            {upcoming.map((m) => (
              <li key={m.id} className="flex justify-between items-center p-2.5 rounded-lg bg-secondary/50">
                <div><div className="font-medium text-sm">{m.title}</div><div className="text-xs text-muted-foreground">{m.client} ↔ {m.developer}</div></div>
                <div className="text-right text-xs"><div className="font-medium">{m.date}</div><div className="text-muted-foreground">{m.time}</div></div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card rounded-2xl shadow-card p-5">
          <h3 className="font-bold mb-3">Top Project Revenue (Paid)</h3>
          <ul className="space-y-2">
            {profitability.map(({ project, client, developer, revenue }) => (
              <li key={project.id} className="flex justify-between items-center p-2.5 rounded-lg bg-secondary/50">
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{project.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{client?.company} • {developer?.name}</div>
                </div>
                <div className="font-bold text-emerald-600 shrink-0">{inr(revenue)}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
};

export default Index;
