import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Download, Edit, Trash2, Send, Copy, Receipt as ReceiptIcon } from "lucide-react";
import { useInvoices, useClients, useTaxSettings, useReceipts, useCanWrite, deleteInvoice, updateInvoice, duplicateInvoice, type Invoice } from "@/data/store";
import { CreateInvoiceDialog } from "@/components/dialogs/CreateInvoiceDialog";
import { InvoicePreviewDialog } from "@/components/dialogs/InvoicePreviewDialog";
import { RecordReceiptDialog } from "@/components/dialogs/RecordReceiptDialog";
import { generateInvoicePdf } from "@/lib/invoicePdf";
import { downloadBlob } from "@/lib/gstExport";
import { inr } from "@/lib/format";
import { toast } from "sonner";

const Billing = () => {
  const invoices = useInvoices();
  const clients = useClients();
  const tax = useTaxSettings();
  const receipts = useReceipts();
  const canWrite = useCanWrite();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | undefined>();
  const [previewing, setPreviewing] = useState<Invoice | null>(null);
  const [receiptFor, setReceiptFor] = useState<Invoice | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return invoices.filter((i) => {
      const c = clients.find((cl) => cl.id === i.clientId);
      return i.number.toLowerCase().includes(q) || c?.name.toLowerCase().includes(q) || c?.company.toLowerCase().includes(q);
    });
  }, [invoices, clients, search]);

  const totals = {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0),
    pending: invoices.filter((i) => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + i.total, 0),
    drafts: invoices.filter((i) => i.status === "draft").length,
  };

  const downloadPdf = (inv: Invoice) => {
    const c = clients.find((cl) => cl.id === inv.clientId);
    if (!c) return;
    const pdf = generateInvoicePdf(inv, c, tax);
    downloadBlob(pdf.output("blob"), `${inv.number}.pdf`);
    toast.success("Invoice downloaded");
  };

  const sendInvoice = (inv: Invoice) => {
    const c = clients.find((cl) => cl.id === inv.clientId);
    if (!c) return;
    updateInvoice(inv.id, { status: "sent" });
    const subject = encodeURIComponent(`Invoice ${inv.number} from ${tax.company.name}`);
    const body = encodeURIComponent(`Hi ${c.name},\n\nPlease find attached invoice ${inv.number} for ₹${inv.total.toLocaleString("en-IN")}.\nDue on ${inv.dueDate}.\n\nRegards,\n${tax.company.name}`);
    window.open(`mailto:${c.email}?subject=${subject}&body=${body}`);
    toast.success("Marked as sent — email draft opened");
  };

  const statusColor = (s: Invoice["status"]) => ({
    paid: "bg-emerald-100 text-emerald-700",
    sent: "bg-blue-100 text-blue-700",
    draft: "bg-gray-100 text-gray-700",
    overdue: "bg-rose-100 text-rose-700",
  }[s]);

  return (
    <>
      <PageHeader
        title="Billing"
        subtitle={canWrite ? "Generate, send, and manage tax invoices for your clients" : "View and download tax invoices (read-only)"}
        action={canWrite ? <Button onClick={() => { setEditing(undefined); setCreateOpen(true); }}><Plus className="h-4 w-4" /> Create Invoice</Button> : undefined}
      />


      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard value={String(totals.total)} label="Total Invoices" variant="blue" />
        <StatCard value={inr(totals.paid)} label="Paid" variant="green" />
        <StatCard value={inr(totals.pending)} label="Outstanding" variant="orange" />
        <StatCard value={String(totals.drafts)} label="Drafts" variant="purple" />
      </section>

      <section className="bg-card rounded-2xl shadow-card p-4">
        <Input placeholder="Search invoices by number, client, or company..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </section>

      <section className="bg-card rounded-2xl shadow-card divide-y">
        {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground">{canWrite ? "No invoices yet — click Create Invoice to get started." : "No invoices to show yet."}</div>}
        {filtered.map((inv) => {
          const c = clients.find((cl) => cl.id === inv.clientId);
          return (
            <div key={inv.id} className="p-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{inv.number}</span>
                  <Badge className={`${statusColor(inv.status)} border-0 capitalize`}>{inv.status}</Badge>
                  {inv.interstate && <Badge variant="outline">Inter-state</Badge>}
                </div>
                <div className="text-sm mt-1 truncate">{c?.name} — <span className="text-muted-foreground">{c?.company}</span></div>
                <div className="text-xs text-muted-foreground">Issued {inv.issueDate} • Due {inv.dueDate}</div>
              </div>
              <div className="lg:text-right">
                <div className="text-2xl font-bold text-emerald-600 whitespace-nowrap">{inr(inv.total)}</div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">Subtotal {inr(inv.subtotal)} + GST {inr(inv.gstAmount)}</div>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Button size="sm" variant="outline" onClick={() => setPreviewing(inv)}><Eye className="h-3.5 w-3.5" />View</Button>
                <Button size="sm" variant="outline" onClick={() => downloadPdf(inv)}><Download className="h-3.5 w-3.5" />PDF</Button>
                {canWrite && <Button size="sm" variant="outline" onClick={() => { setEditing(inv); setCreateOpen(true); }}><Edit className="h-3.5 w-3.5" />Edit</Button>}
                {canWrite && <Button size="sm" variant="outline" onClick={() => { const num = duplicateInvoice(inv.id); if (num) toast.success(`Duplicated as ${num}`); }}><Copy className="h-3.5 w-3.5" />Duplicate</Button>}
                {canWrite && inv.status !== "paid" && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => sendInvoice(inv)}><Send className="h-3.5 w-3.5" />Send</Button>
                    <Button size="sm" onClick={() => setReceiptFor(inv)}><ReceiptIcon className="h-3.5 w-3.5" />Record Payment</Button>
                  </>
                )}
                {canWrite && <Button size="sm" variant="ghost" onClick={() => { if (confirm(`Delete ${inv.number}?`)) { deleteInvoice(inv.id); toast.success("Deleted"); } }}><Trash2 className="h-3.5 w-3.5" /></Button>}

              </div>
              {receipts.filter((r) => r.invoiceId === inv.id).length > 0 && (
                <div className="lg:col-span-3 text-xs text-muted-foreground border-t pt-2">
                  Receipts: {receipts.filter((r) => r.invoiceId === inv.id).map((r) => `${inr(r.amount)} on ${r.date} via ${r.mode}${r.reference ? ` (${r.reference})` : ""}`).join(" · ")}
                </div>
              )}
            </div>
          );
        })}
      </section>

      <CreateInvoiceDialog open={createOpen} onOpenChange={setCreateOpen} editing={editing} />
      <InvoicePreviewDialog invoice={previewing} open={!!previewing} onOpenChange={(o) => !o && setPreviewing(null)} />
      <RecordReceiptDialog invoice={receiptFor} open={!!receiptFor} onOpenChange={(o) => !o && setReceiptFor(null)} />
    </>
  );
};

export default Billing;
