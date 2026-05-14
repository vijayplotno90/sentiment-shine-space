import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useInvoices, useExpenses, useDevelopers, useClients, useReceipts, useTaxSettings } from "@/data/store";
import { inr, agingBuckets, today } from "@/lib/format";
import { Download } from "lucide-react";

const Reports = () => {
  const invoices = useInvoices();
  const expenses = useExpenses();
  const developers = useDevelopers();
  const clients = useClients();
  const receipts = useReceipts();
  const tax = useTaxSettings();

  const fyStart = (() => { const d = new Date(); const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1; return `${y}-04-01`; })();
  const [from, setFrom] = useState(fyStart);
  const [to, setTo] = useState(today());

  const inRange = (d: string) => d >= from && d <= to;

  const data = useMemo(() => {
    const inv = invoices.filter((i) => inRange(i.issueDate));
    const exp = expenses.filter((e) => inRange(e.date));
    const rec = receipts.filter((r) => inRange(r.date));
    const revenue = inv.reduce((s, i) => s + i.subtotal, 0);
    const gstOut = inv.reduce((s, i) => s + i.gstAmount, 0);
    const opex = exp.filter((e) => !e.isAsset).reduce((s, e) => s + e.amount, 0);
    const capex = exp.filter((e) => e.isAsset).reduce((s, e) => s + e.amount, 0);
    const gstIn = exp.filter((e) => e.itcEligible !== false).reduce((s, e) => s + e.gstAmount, 0);
    const payroll = developers.reduce((s, d) => s + d.salary, 0); // monthly snapshot
    const months = Math.max(1, Math.round(((+new Date(to)) - (+new Date(from))) / (30 * 86400000)));
    const payrollPeriod = payroll * months;
    const tdsReceivable = inv.reduce((s, i) => s + (i.tdsDeducted || 0), 0);
    const tdsDeducted = exp.reduce((s, e) => s + (e.tdsDeducted || 0), 0);
    const cashIn = rec.reduce((s, r) => s + r.amount, 0);
    return {
      inv, exp, rec, revenue, gstOut, opex, capex, gstIn, payroll, payrollPeriod,
      months, tdsReceivable, tdsDeducted, cashIn,
      netGst: gstOut - gstIn,
      netProfit: revenue - opex - payrollPeriod,
    };
  }, [invoices, expenses, receipts, developers, from, to]);

  const aging = useMemo(() => agingBuckets(invoices), [invoices]);

  const exportPLCsv = () => {
    const rows = [
      ["P&L Statement", `${from} to ${to}`],
      [], ["Particulars", "Amount (₹)"],
      ["Revenue (taxable)", data.revenue],
      ["Less: Operating Expenses", data.opex],
      ["Less: Payroll (estimated)", data.payrollPeriod],
      ["Net Profit (Pre-Tax)", data.netProfit],
      [], ["GST Summary"],
      ["Output GST (collected)", data.gstOut],
      ["Input GST credit (ITC eligible)", data.gstIn],
      ["Net GST payable", data.netGst],
      [], ["TDS Summary"],
      ["TDS Receivable (deducted by clients)", data.tdsReceivable],
      ["TDS Deducted (paid to vendors)", data.tdsDeducted],
      [], ["Capital Assets purchased", data.capex],
      ["Cash received", data.cashIn],
    ];
    const csv = rows.map((r) => r.map((c) => typeof c === "string" && /[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `PnL-${from}_to_${to}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader title="Financial Reports" subtitle="P&L, GST 3B, TDS reconciliation, receivables aging — for you and your CA"
        action={<Button onClick={exportPLCsv}><Download className="h-4 w-4" />Export P&L CSV</Button>} />

      <section className="bg-card rounded-2xl shadow-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div><Label>From</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><Label>To</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <div className="text-sm text-muted-foreground">Period spans ~{data.months} month(s). Default: current FY.</div>
      </section>

      <Tabs defaultValue="pl">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-card shadow-card rounded-xl p-1 h-auto">
          <TabsTrigger value="pl" className="py-2.5">Profit & Loss</TabsTrigger>
          <TabsTrigger value="gstr" className="py-2.5">GSTR-3B Summary</TabsTrigger>
          <TabsTrigger value="tds" className="py-2.5">TDS Summary</TabsTrigger>
          <TabsTrigger value="aging" className="py-2.5">Receivables Aging</TabsTrigger>
        </TabsList>

        <TabsContent value="pl" className="mt-4 space-y-3">
          <div className="bg-card rounded-2xl shadow-card p-6 space-y-2">
            <Row label="Revenue (taxable supplies)" value={inr(data.revenue)} tone="text-emerald-600" />
            <Row label="Less: Operating expenses" value={inr(data.opex)} tone="text-rose-600" />
            <Row label={`Less: Payroll (₹${data.payroll.toLocaleString("en-IN")}/mo × ${data.months})`} value={inr(data.payrollPeriod)} tone="text-rose-600" />
            <div className="border-t pt-2"><Row label="Net Profit (Pre-Tax)" value={inr(data.netProfit)} bold tone={data.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"} /></div>
            <Row label="Capital assets acquired (depreciable)" value={inr(data.capex)} tone="text-muted-foreground" />
            <Row label="Cash received in period" value={inr(data.cashIn)} tone="text-muted-foreground" />
          </div>
        </TabsContent>

        <TabsContent value="gstr" className="mt-4 space-y-3">
          <div className="bg-card rounded-2xl shadow-card p-6 space-y-2">
            <div className="text-sm text-muted-foreground mb-3">For {tax.company.name} • GSTIN {tax.company.gstin}</div>
            <Row label="3.1(a) Outward taxable supplies" value={inr(data.revenue)} />
            <Row label="    Output GST (CGST+SGST or IGST)" value={inr(data.gstOut)} />
            <Row label="4(A)(5) ITC — All other ITC" value={inr(data.gstIn)} />
            <div className="border-t pt-2"><Row label="Net GST payable in cash" value={inr(data.netGst)} bold tone="text-primary" /></div>
            <div className="text-xs text-muted-foreground pt-2">Note: This is a simplified GSTR-3B summary. For exempt/nil-rated supplies, RCM and ineligible ITC adjustments, refer to detailed GSTR exports from Finance → Export GST.</div>
          </div>
        </TabsContent>

        <TabsContent value="tds" className="mt-4 space-y-3">
          <div className="bg-card rounded-2xl shadow-card p-6 space-y-2">
            <Row label={`TDS Receivable (deducted by clients @ ${tax.tdsRate}%)`} value={inr(data.tdsReceivable)} tone="text-emerald-600" />
            <div className="text-xs text-muted-foreground pl-2">→ Reconcile with Form 26AS / TRACES; claim refund or adjust against advance tax</div>
            <Row label="TDS Deducted (you withheld on vendor payments)" value={inr(data.tdsDeducted)} tone="text-amber-600" />
            <div className="text-xs text-muted-foreground pl-2">→ Deposit by 7th of next month; file 26Q quarterly</div>
          </div>
          <div className="bg-card rounded-2xl shadow-card p-6">
            <h3 className="font-bold mb-3">TDS by client (this period)</h3>
            <ul className="divide-y">
              {data.inv.filter((i) => i.tdsDeducted).map((i) => {
                const c = clients.find((cl) => cl.id === i.clientId);
                return (
                  <li key={i.id} className="flex justify-between py-2 text-sm">
                    <div>{c?.name} <span className="text-muted-foreground">— {c?.company}</span> • {i.number}</div>
                    <div className="font-bold text-emerald-600">{inr(i.tdsDeducted!)}</div>
                  </li>
                );
              })}
              {data.inv.filter((i) => i.tdsDeducted).length === 0 && <li className="py-3 text-sm text-muted-foreground">No TDS recorded in this period.</li>}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="aging" className="mt-4 space-y-3">
          <div className="bg-card rounded-2xl shadow-card p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Bucket label="Current (not due)" value={aging.current} tone="bg-emerald-50 text-emerald-700" />
              <Bucket label="1–30 days" value={aging.d30} tone="bg-amber-50 text-amber-700" />
              <Bucket label="31–60 days" value={aging.d60} tone="bg-orange-50 text-orange-700" />
              <Bucket label="61–90 days" value={aging.d90} tone="bg-rose-50 text-rose-700" />
              <Bucket label="90+ days" value={aging.d90Plus} tone="bg-rose-100 text-rose-900" />
            </div>
            <h3 className="font-bold mt-6 mb-2">Outstanding invoices</h3>
            <ul className="divide-y">
              {invoices.filter((i) => i.status !== "paid" && i.status !== "draft").sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map((i) => {
                const c = clients.find((cl) => cl.id === i.clientId);
                const days = Math.floor((+new Date() - +new Date(i.dueDate)) / 86400000);
                return (
                  <li key={i.id} className="flex justify-between py-2 text-sm">
                    <div>{i.number} — {c?.name} <span className="text-muted-foreground">({c?.company})</span></div>
                    <div className="text-right">
                      <div className="font-bold">{inr(i.total - (i.tdsDeducted || 0))}</div>
                      <div className="text-xs text-muted-foreground">{days > 0 ? `${days}d overdue` : `due in ${-days}d`}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

const Row = ({ label, value, bold, tone }: { label: string; value: string; bold?: boolean; tone?: string }) => (
  <div className={`flex justify-between p-3 rounded-lg ${bold ? "bg-primary/10" : "bg-secondary/40"}`}>
    <span className={bold ? "font-semibold" : ""}>{label}</span>
    <span className={`${bold ? "font-bold" : "font-semibold"} ${tone || ""}`}>{value}</span>
  </div>
);

const Bucket = ({ label, value, tone }: { label: string; value: number; tone: string }) => (
  <div className={`p-4 rounded-xl ${tone}`}>
    <div className="text-xs">{label}</div>
    <div className="font-bold text-lg mt-1">{inr(value)}</div>
  </div>
);

export default Reports;
