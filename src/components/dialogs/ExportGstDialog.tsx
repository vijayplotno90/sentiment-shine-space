import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useInvoices, useExpenses, useClients, useTaxSettings } from "@/data/store";
import { buildGstZip, downloadBlob } from "@/lib/gstExport";
import { inr } from "@/lib/format";
import { toast } from "sonner";

type Preset = "this-month" | "last-month" | "this-quarter" | "last-quarter" | "this-fy" | "last-fy" | "custom";

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function rangeFor(preset: Preset, now = new Date()): { from: string; to: string; label: string } {
  const y = now.getFullYear();
  const m = now.getMonth();
  const fyStartYear = m >= 3 ? y : y - 1; // India FY April–March
  const startOfMonth = (yy: number, mm: number) => new Date(yy, mm, 1);
  const endOfMonth = (yy: number, mm: number) => new Date(yy, mm + 1, 0);
  const qStart = (yy: number, mm: number) => startOfMonth(yy, Math.floor(mm / 3) * 3);
  const qEnd = (yy: number, mm: number) => endOfMonth(yy, Math.floor(mm / 3) * 3 + 2);

  switch (preset) {
    case "this-month": return { from: ymd(startOfMonth(y, m)), to: ymd(endOfMonth(y, m)), label: `${y}-${pad(m + 1)}` };
    case "last-month": {
      const d = new Date(y, m - 1, 1);
      return { from: ymd(startOfMonth(d.getFullYear(), d.getMonth())), to: ymd(endOfMonth(d.getFullYear(), d.getMonth())), label: `${d.getFullYear()}-${pad(d.getMonth() + 1)}` };
    }
    case "this-quarter": return { from: ymd(qStart(y, m)), to: ymd(qEnd(y, m)), label: `${y}-Q${Math.floor(m / 3) + 1}` };
    case "last-quarter": {
      const d = new Date(y, m - 3, 1);
      return { from: ymd(qStart(d.getFullYear(), d.getMonth())), to: ymd(qEnd(d.getFullYear(), d.getMonth())), label: `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}` };
    }
    case "this-fy": return { from: `${fyStartYear}-04-01`, to: `${fyStartYear + 1}-03-31`, label: `FY${fyStartYear}-${String(fyStartYear + 1).slice(2)}` };
    case "last-fy": return { from: `${fyStartYear - 1}-04-01`, to: `${fyStartYear}-03-31`, label: `FY${fyStartYear - 1}-${String(fyStartYear).slice(2)}` };
    case "custom": return { from: ymd(startOfMonth(y, m)), to: ymd(endOfMonth(y, m)), label: "custom" };
  }
}

export const ExportGstDialog = ({ open, onOpenChange, mode = "download", onAfterExport }: { open: boolean; onOpenChange: (o: boolean) => void; mode?: "download" | "email"; onAfterExport?: (label: string) => void }) => {
  const invoices = useInvoices();
  const expenses = useExpenses();
  const clients = useClients();
  const tax = useTaxSettings();
  const [preset, setPreset] = useState<Preset>("this-month");
  const [custom, setCustom] = useState(() => rangeFor("this-month"));

  const range = preset === "custom" ? custom : rangeFor(preset);

  const filtered = useMemo(() => {
    const inRange = (d: string) => d >= range.from && d <= range.to;
    return {
      invoices: invoices.filter((i) => inRange(i.issueDate)),
      expenses: expenses.filter((e) => inRange(e.date)),
    };
  }, [invoices, expenses, range.from, range.to]);

  const totals = useMemo(() => ({
    revenue: filtered.invoices.reduce((s, i) => s + i.subtotal, 0),
    gstOut: filtered.invoices.reduce((s, i) => s + i.gstAmount, 0),
    expense: filtered.expenses.reduce((s, e) => s + e.amount, 0),
    gstIn: filtered.expenses.reduce((s, e) => s + e.gstAmount, 0),
  }), [filtered]);

  const doExport = async () => {
    if (!filtered.invoices.length && !filtered.expenses.length) { toast.error("Nothing to export in this period"); return; }
    toast.info("Generating GST package...");
    const blob = await buildGstZip({ invoices: filtered.invoices, expenses: filtered.expenses, clients, tax, period: range.label });
    downloadBlob(blob, `GST-${range.label}.zip`);
    toast.success("GST package downloaded");
    onAfterExport?.(range.label);
    onOpenChange(false);
  };

  const presets: { value: Preset; label: string }[] = [
    { value: "this-month", label: "This month" },
    { value: "last-month", label: "Last month" },
    { value: "this-quarter", label: "This quarter" },
    { value: "last-quarter", label: "Last quarter" },
    { value: "this-fy", label: "This FY (Apr–Mar)" },
    { value: "last-fy", label: "Last FY" },
    { value: "custom", label: "Custom range" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Export GST Package</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Period</Label>
            <RadioGroup value={preset} onValueChange={(v) => setPreset(v as Preset)} className="grid grid-cols-2 gap-2">
              {presets.map((p) => (
                <label key={p.value} className="flex items-center gap-2 p-2 rounded-md border hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value={p.value} />
                  <span className="text-sm">{p.label}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {preset === "custom" && (
            <div className="grid grid-cols-2 gap-3">
              <div><Label>From</Label><Input type="date" value={custom.from} onChange={(e) => setCustom({ ...custom, from: e.target.value, label: `${e.target.value}_to_${custom.to}` })} /></div>
              <div><Label>To</Label><Input type="date" value={custom.to} onChange={(e) => setCustom({ ...custom, to: e.target.value, label: `${custom.from}_to_${e.target.value}` })} /></div>
            </div>
          )}

          <div className="rounded-lg bg-secondary/50 p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Range</span><span className="font-medium">{range.from} → {range.to}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Invoices</span><span>{filtered.invoices.length} • {inr(totals.revenue)} (GST {inr(totals.gstOut)})</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Expenses</span><span>{filtered.expenses.length} • {inr(totals.expense)} (GST {inr(totals.gstIn)})</span></div>
            <div className="flex justify-between border-t pt-1 mt-1"><span className="font-semibold">Net GST payable</span><span className="font-bold text-primary">{inr(totals.gstOut - totals.gstIn)}</span></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={doExport}>{mode === "email" ? "Generate & Email CA" : "Download ZIP"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
