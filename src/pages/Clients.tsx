import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, CheckCircle2 } from "lucide-react";
import { useClients, addClient, deleteClient } from "@/data/store";
import { toast } from "sonner";

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
    if (!form.name || !form.email) {
      toast.error("Name and email are required");
      return;
    }
    addClient({
      name: form.name,
      email: form.email,
      company: form.company,
      technologies: form.technologies.split(",").map((t) => t.trim()).filter(Boolean),
    });
    setForm({ name: "", email: "", company: "", technologies: "" });
    toast.success("Client added");
  };

  const remove = (id: string, name: string) => {
    deleteClient(id);
    toast.success(`${name} removed`);
  };

  return (
    <>
      <PageHeader title="Client Management" subtitle="Manage your clients and track their progress" />

      <section className="bg-card rounded-2xl shadow-card p-6">
        <h2 className="font-bold text-lg">Add New Client</h2>
        <p className="text-sm text-muted-foreground mb-4">Enter client information — saved for this session</p>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input placeholder="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <Input placeholder="Technologies (Java, Spring Boot)" value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} />
          <Button type="submit" className="md:col-span-2 lg:col-span-1 lg:w-auto">
            <CheckCircle2 className="h-4 w-4" />
            Add Client
          </Button>
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
        <p className="text-sm text-muted-foreground mb-4">All your clients with delete functionality</p>
        <ul className="space-y-3">
          {clients.map((c) => (
            <li key={c.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl bg-secondary/50">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary grid place-items-center font-semibold shrink-0">
                {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-muted-foreground">{c.email}</div>
                <div className="text-sm text-muted-foreground">{c.company}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {c.technologies.map((t) => (
                    <Badge key={t} variant="secondary" className="bg-primary/10 text-primary border-0">{t}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Progress</div>
                  <div className="font-bold">{c.progress}%</div>
                </div>
                <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge>
                <Button variant="destructive" size="sm" onClick={() => remove(c.id, c.name)}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
};

export default Clients;
