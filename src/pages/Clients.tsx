import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Trash2, CheckCircle2, Edit, Plus, ChevronDown, Star } from "lucide-react";
import {
  useClients, addClient, deleteClient, useProjects, useDevelopers, useMeetings, useInvoices, type Client,
} from "@/data/store";
import { EditClientDialog } from "@/components/dialogs/EditClientDialog";
import { AddProjectDialog } from "@/components/dialogs/AddProjectDialog";
import { inr } from "@/lib/format";
import { toast } from "sonner";

const ClientRow = ({ c }: { c: Client }) => {
  const projects = useProjects().filter((p) => p.clientId === c.id);
  const devs = useDevelopers();
  const meetings = useMeetings().filter((m) => m.clientId === c.id);
  const invoices = useInvoices().filter((i) => i.clientId === c.id);
  const totalBilled = invoices.reduce((s, i) => s + i.total, 0);
  const paid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const avgSat = projects.length ? (projects.reduce((s, p) => s + p.satisfactionRating, 0) / projects.length).toFixed(1) : "—";

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [projOpen, setProjOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <li className="rounded-xl bg-secondary/50 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary grid place-items-center font-semibold shrink-0">
            {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold">{c.name}</div>
            <div className="text-sm text-muted-foreground">{c.email} • {c.phone || "no phone"}</div>
            <div className="text-sm text-muted-foreground">{c.company} {c.gstin && `• GSTIN ${c.gstin}`}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {c.technologies.map((t) => <Badge key={t} variant="secondary" className="bg-primary/10 text-primary border-0">{t}</Badge>)}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><div className="text-xs text-muted-foreground">Projects</div><div className="font-bold">{projects.length}</div></div>
            <div><div className="text-xs text-muted-foreground">Billed</div><div className="font-bold text-emerald-600">{inr(totalBilled)}</div></div>
            <div><div className="text-xs text-muted-foreground">Avg ★</div><div className="font-bold text-amber-500">{avgSat}</div></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <CollapsibleTrigger asChild><Button size="sm" variant="outline"><ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />History</Button></CollapsibleTrigger>
            <Button size="sm" variant="outline" onClick={() => setProjOpen(true)}><Plus className="h-4 w-4" />Project</Button>
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}><Edit className="h-4 w-4" />Edit</Button>
            <Button size="sm" variant="destructive" onClick={() => { deleteClient(c.id); toast.success(`${c.name} removed`); }}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
        <CollapsibleContent className="mt-4 pt-4 border-t border-border space-y-3">
          <div>
            <div className="font-semibold text-sm mb-2">Projects ({projects.length})</div>
            {projects.length === 0 && <div className="text-sm text-muted-foreground">No projects yet — click Project to add one.</div>}
            {projects.map((p) => {
              const dev = devs.find((d) => d.id === p.assignedDeveloperId);
              return (
                <div key={p.id} className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-card text-sm">
                  <div className="flex-1 min-w-[200px]">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.technology} • Started {p.startDate}</div>
                  </div>
                  <div className="text-xs">Developer: <span className="font-medium text-primary">{dev?.name || "—"}</span></div>
                  <Badge variant={p.status === "active" ? "default" : "secondary"}>{p.status}</Badge>
                  <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < p.satisfactionRating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />)}</div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-card"><div className="text-xs text-muted-foreground">Meetings</div><div className="font-bold">{meetings.length}</div></div>
            <div className="p-3 rounded-lg bg-card"><div className="text-xs text-muted-foreground">Invoices</div><div className="font-bold">{invoices.length}</div></div>
            <div className="p-3 rounded-lg bg-card"><div className="text-xs text-muted-foreground">Paid</div><div className="font-bold text-emerald-600">{inr(paid)}</div></div>
            <div className="p-3 rounded-lg bg-card"><div className="text-xs text-muted-foreground">Outstanding</div><div className="font-bold text-amber-600">{inr(totalBilled - paid)}</div></div>
          </div>
        </CollapsibleContent>
      </li>
      <EditClientDialog client={c} open={editOpen} onOpenChange={setEditOpen} />
      <AddProjectDialog clientId={c.id} open={projOpen} onOpenChange={setProjOpen} />
    </Collapsible>
  );
};

const Clients = () => {
  const clients = useClients();
  const [form, setForm] = useState({ name: "", email: "", company: "", technologies: "" });

  const totals = {
    total: clients.length,
    active: clients.filter((c) => c.status === "active").length,
    fresh: clients.filter((c) => c.status === "new").length,
    avg: clients.length ? Math.round(clients.reduce((s, c) => s + c.progress, 0) / clients.length) : 0,
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) { toast.error("Name and email required"); return; }
    addClient({ name: form.name, email: form.email, company: form.company, technologies: form.technologies.split(",").map((t) => t.trim()).filter(Boolean) });
    setForm({ name: "", email: "", company: "", technologies: "" });
    toast.success("Client added");
  };

  return (
    <>
      <PageHeader title="Client Management" subtitle="Edit details, add projects, and view full client history" />

      <section className="bg-card rounded-2xl shadow-card p-6">
        <h2 className="font-bold text-lg">Add New Client</h2>
        <p className="text-sm text-muted-foreground mb-4">Create a client — you can add projects and invoices afterwards</p>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input placeholder="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <Input placeholder="Technologies (Java, Spring Boot)" value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} />
          <Button type="submit"><CheckCircle2 className="h-4 w-4" />Add Client</Button>
        </form>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard value={String(totals.total)} label="Total Clients" variant="blue" />
        <StatCard value={String(totals.active)} label="Active Clients" variant="green" />
        <StatCard value={String(totals.fresh)} label="New Clients" variant="purple" />
        <StatCard value={`${totals.avg}%`} label="Avg Progress" variant="orange" />
      </section>

      <section className="bg-card rounded-2xl shadow-card p-6">
        <h2 className="font-bold text-lg">Client List ({clients.length} total)</h2>
        <p className="text-sm text-muted-foreground mb-4">Click History to see projects, meetings, invoices and satisfaction</p>
        <ul className="space-y-3">
          {clients.map((c) => <ClientRow key={c.id} c={c} />)}
        </ul>
      </section>
    </>
  );
};

export default Clients;
