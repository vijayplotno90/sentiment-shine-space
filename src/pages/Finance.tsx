import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, FileText, Settings, Plus, Trash2, Mail } from "lucide-react";
import { useInvoices, useExpenses, useDevelopers, useClients, useTaxSettings, updateInvoice, deleteExpense, useCanWrite } from "@/data/store";
import { TaxSettingsDialog } from "@/components/dialogs/TaxSettingsDialog";
import { AddExpenseDialog } from "@/components/dialogs/AddExpenseDialog";
import { ExportGstDialog } from "@/components/dialogs/ExportGstDialog";
import { inr } from "@/lib/format";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const Finance = () => {
  const invoices = useInvoices();
  const expenses = useExpenses();
  const developers = useDevelopers();
  const clients = useClients();
  const tax = useTaxSettings();
  const canWrite = useCanWrite();
  const [taxOpen, setTaxOpen] = useState(false);
  const [expOpen, setExpOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportMode, setExportMode] = useState<"download" | "email">("download");

  const totalRevenue = invoices.reduce((s, i) => s + i.subtotal, 0);
  const paidRevenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.subtotal, 0);
  const pending = invoices.filter((i) => i.status !== "paid").reduce((s, i) => s + i.total, 0);
  const pendingClients = invoices.filter((i) => i.status !== "paid").length;
  const gstCollected = invoices.reduce((s, i) => s + i.gstAmount, 0);
  const gstPaid = expenses.reduce((s, e) => s + e.gstAmount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const payouts = developers.reduce((s, d) => s + d.salary, 0);
  const netProfit = paidRevenue - payouts - totalExpenses;

  const openExport = (mode: "download" | "email") => {
    if (mode === "email" && !tax.company.caEmail) { toast.error("Add CA email in Settings first"); setTaxOpen(true); return; }
    setExportMode(mode);
    setExportOpen(true);
  };

  const handleAfterExport = (label: string) => {
    if (exportMode !== "email") return;
    const subject = encodeURIComponent(`GST Filing Package — ${label}`);
    const body = encodeURIComponent(`Hi,\n\nPlease find the GST filing package for ${tax.company.name} (GSTIN ${tax.company.gstin}) for ${label}. The ZIP includes GSTR-1, GSTR-2 CSVs, summary, and per-invoice PDFs (downloaded to your machine — please attach).\n\nRegards,\n${tax.company.name}`);
    window.open(`mailto:${tax.company.caEmail}?subject=${subject}&body=${body}`);
  };

  const expensesByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.total;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <PageHeader title="Financial Management" subtitle="Revenue, expenses, GST and CA-ready reports"
        action={
          <div className="flex gap-2 flex-wrap">
            {canWrite && <Button variant="outline" onClick={() => setTaxOpen(true)}><Settings className="h-4 w-4" />Tax Settings</Button>}
            {canWrite && <Link to="/billing"><Button variant="outline"><FileText className="h-4 w-4" />Generate Invoice</Button></Link>}
            <Button onClick={() => openExport("download")}>Export GST</Button>
          </div>
        } />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile color="bg-stat-green" value={inr(totalRevenue)} label="Total Revenue" sub={<><TrendingUp className="h-3.5 w-3.5" />{invoices.length} invoices</>} />
        <Tile color="bg-stat-orange" value={inr(pending)} label="Outstanding" sub={`${pendingClients} invoice(s)`} />
        <Tile color="bg-stat-purple" value={inr(netProfit)} label="Net Profit" sub="Paid revenue − payroll − expenses" />
        <Tile color="bg-stat-blue" value={inr(gstCollected - gstPaid)} label="Net GST Payable" sub={`Collected ${inr(gstCollected)} − Paid ${inr(gstPaid)}`} />
      </section>

      <Tabs defaultValue="invoices">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-card shadow-card rounded-xl p-1 h-auto">
          <TabsTrigger value="invoices" className="py-2.5">Invoices</TabsTrigger>
          <TabsTrigger value="payouts" className="py-2.5">Developer Payouts</TabsTrigger>
          <TabsTrigger value="expenses" className="py-2.5">Expenses</TabsTrigger>
          <TabsTrigger value="assets" className="py-2.5">Asset Register</TabsTrigger>
          <TabsTrigger value="reports" className="py-2.5">GST Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-4 space-y-4">
          {invoices.map((inv) => {
            const c = clients.find((cl) => cl.id === inv.clientId);
            return (
              <div key={inv.id} className="bg-card rounded-2xl shadow-card p-5 flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1">
                  <div className="font-bold">{inv.number} <Badge className={inv.status === "paid" ? "bg-emerald-100 text-emerald-700 border-0 ml-2" : "bg-amber-100 text-amber-700 border-0 ml-2"}>{inv.status}</Badge></div>
                  <div className="text-sm">{c?.name} — <span className="text-muted-foreground">{c?.company}</span></div>
                  <div className="text-xs text-muted-foreground">Due {inv.dueDate}</div>
                </div>
                <div className="text-right"><div className="text-2xl font-bold text-emerald-600">{inr(inv.total)}</div><div className="text-xs text-muted-foreground">GST {inr(inv.gstAmount)}</div></div>
                <div className="flex gap-2">
                  {canWrite && inv.status !== "paid" && <Button size="sm" variant="outline" onClick={() => toast.success("Reminder sent")}>Send Reminder</Button>}
                  {canWrite && inv.status !== "paid" && <Button size="sm" onClick={() => { updateInvoice(inv.id, { status: "paid", paidDate: new Date().toISOString().slice(0, 10) }); toast.success("Marked paid"); }}>Mark Paid</Button>}
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="payouts" className="mt-4">
          <div className="bg-card rounded-2xl shadow-card p-6 space-y-3">
            {developers.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                <div><div className="font-semibold">{d.name}</div><div className="text-xs text-muted-foreground">{d.level} • {d.activeClients} active clients</div></div>
                <div className="text-right"><div className="text-lg font-bold text-emerald-600">{inr(d.salary)}</div><div className="text-xs text-muted-foreground">Monthly salary</div></div>
              </div>
            ))}
            <div className="flex justify-between p-4 rounded-xl bg-primary/10"><span className="font-semibold">Total payroll</span><span className="font-bold text-primary">{inr(payouts)}</span></div>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
              {Object.entries(expensesByCategory).map(([cat, amt]) => (
                <div key={cat} className="p-3 rounded-lg bg-card shadow-card">
                  <div className="text-xs text-muted-foreground capitalize">{cat}</div>
                  <div className="font-bold">{inr(amt)}</div>
                </div>
              ))}
            </div>
            {canWrite && <Button onClick={() => setExpOpen(true)} className="ml-3"><Plus className="h-4 w-4" />Add Expense</Button>}
          </div>
          <div className="bg-card rounded-2xl shadow-card divide-y">
            {expenses.map((e) => (
              <div key={e.id} className="p-4 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="font-medium">{e.description || e.vendor}</div>
                  <div className="text-xs text-muted-foreground">{e.vendor} {e.vendorGstin && `• ${e.vendorGstin}`} • {e.date}</div>
                </div>
                <Badge variant="secondary" className="capitalize">{e.category}</Badge>
                {e.isAsset && <Badge className="bg-purple-100 text-purple-700 border-0">Asset {e.assetTag}</Badge>}
                <div className="text-right"><div className="font-bold">{inr(e.total)}</div><div className="text-xs text-muted-foreground">GST {inr(e.gstAmount)}</div></div>
                {canWrite && <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete expense?")) { deleteExpense(e.id); toast.success("Deleted"); } }}><Trash2 className="h-4 w-4" /></Button>}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assets" className="mt-4">
          <div className="bg-card rounded-2xl shadow-card divide-y">
            {expenses.filter((e) => e.isAsset).map((e) => (
              <div key={e.id} className="p-4 flex justify-between">
                <div>
                  <div className="font-medium">{e.description}</div>
                  <div className="text-xs text-muted-foreground">{e.assetTag} • {e.vendor} • acquired {e.date}</div>
                </div>
                <div className="text-right"><div className="font-bold">{inr(e.total)}</div><div className="text-xs text-muted-foreground capitalize">{e.category}</div></div>
              </div>
            ))}
            {expenses.filter((e) => e.isAsset).length === 0 && <div className="p-8 text-center text-muted-foreground">No capital assets recorded yet.</div>}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <div className="bg-card rounded-2xl shadow-card p-6 space-y-3">
            <div className="flex justify-between p-4 rounded-xl bg-secondary/50"><span>Output GST collected</span><span className="font-bold">{inr(gstCollected)}</span></div>
            <div className="flex justify-between p-4 rounded-xl bg-secondary/50"><span>Input GST credit (expenses)</span><span className="font-bold">{inr(gstPaid)}</span></div>
            <div className="flex justify-between p-4 rounded-xl bg-primary/10"><span className="font-semibold">Net GST payable</span><span className="font-bold text-primary">{inr(gstCollected - gstPaid)}</span></div>
            <div className="flex justify-between p-4 rounded-xl bg-secondary/50"><span>Total revenue (taxable)</span><span className="font-bold">{inr(totalRevenue)}</span></div>
            <div className="flex justify-between p-4 rounded-xl bg-secondary/50"><span>Total expenses (taxable)</span><span className="font-bold">{inr(totalExpenses)}</span></div>
            <div className="flex justify-between p-4 rounded-xl bg-secondary/50"><span>Net profit</span><span className="font-bold text-emerald-600">{inr(netProfit)}</span></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <Button className="w-full" onClick={() => openExport("download")}>Download ZIP for CA</Button>
              <Button className="w-full" variant="outline" onClick={() => openExport("email")}><Mail className="h-4 w-4" />Email to CA ({tax.company.caEmail || "set in settings"})</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <TaxSettingsDialog open={taxOpen} onOpenChange={setTaxOpen} />
      <AddExpenseDialog open={expOpen} onOpenChange={setExpOpen} />
      <ExportGstDialog open={exportOpen} onOpenChange={setExportOpen} mode={exportMode} onAfterExport={handleAfterExport} />
    </>
  );
};

const Tile = ({ color, value, label, sub }: { color: string; value: string; label: string; sub: React.ReactNode }) => (
  <div className={`rounded-2xl p-6 text-white shadow-stat ${color}`}>
    <div className="text-3xl font-bold">{value}</div>
    <div className="text-sm font-medium mt-1">{label}</div>
    <div className="mt-3 text-xs flex items-center gap-1 opacity-90">{sub}</div>
  </div>
);

export default Finance;
