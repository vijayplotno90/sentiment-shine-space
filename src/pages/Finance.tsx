import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, FileText, Send } from "lucide-react";
import { usePayments, useDevelopers, markPaymentPaid } from "@/data/store";
import { toast } from "sonner";

const Finance = () => {
  const payments = usePayments();
  const developers = useDevelopers();

  const totalRevenue = payments.reduce((s, p) => s + p.base, 0);
  const pending = payments.filter((p) => p.status === "pending").reduce((s, p) => s + p.total, 0);
  const pendingClients = payments.filter((p) => p.status === "pending").length;
  const gst = payments.reduce((s, p) => s + p.gst, 0);
  const payouts = developers.reduce((s, d) => s + d.monthlyEarnings, 0);
  const expenses = 23000;
  const netProfit = totalRevenue - payouts - expenses;

  return (
    <>
      <PageHeader
        title="Financial Management"
        subtitle="Track payments, manage payouts, and generate reports"
        action={
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="h-4 w-4" />
              Generate Invoice
            </Button>
            <Button>Export GST Report</Button>
          </div>
        }
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl p-6 text-white shadow-stat bg-stat-green">
          <div className="text-3xl font-bold">₹{totalRevenue.toLocaleString("en-IN")}</div>
          <div className="text-sm font-medium mt-1">Total Revenue</div>
          <div className="mt-3 text-xs flex items-center gap-1 opacity-90">
            <TrendingUp className="h-3.5 w-3.5" /> 12.5% vs last month
          </div>
        </div>
        <div className="rounded-2xl p-6 text-white shadow-stat bg-stat-orange">
          <div className="text-3xl font-bold">₹{pending.toLocaleString("en-IN")}</div>
          <div className="text-sm font-medium mt-1">Pending Payments</div>
          <div className="mt-3 text-xs opacity-90">{pendingClients} client{pendingClients !== 1 && "s"}</div>
        </div>
        <div className="rounded-2xl p-6 text-white shadow-stat bg-stat-purple">
          <div className="text-3xl font-bold">₹{netProfit.toLocaleString("en-IN")}</div>
          <div className="text-sm font-medium mt-1">Net Profit</div>
          <div className="mt-3 text-xs opacity-90">After payouts &amp; expenses</div>
        </div>
        <div className="rounded-2xl p-6 text-white shadow-stat bg-stat-blue">
          <div className="text-3xl font-bold">₹{gst.toLocaleString("en-IN")}</div>
          <div className="text-sm font-medium mt-1">GST Collected</div>
          <div className="mt-3 text-xs opacity-90">18% on all services</div>
        </div>
      </section>

      <Tabs defaultValue="payments">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-card shadow-card rounded-xl p-1 h-auto">
          <TabsTrigger value="payments" className="py-2.5">Client Payments</TabsTrigger>
          <TabsTrigger value="payouts" className="py-2.5">Developer Payouts</TabsTrigger>
          <TabsTrigger value="expenses" className="py-2.5">Expense Analysis</TabsTrigger>
          <TabsTrigger value="reports" className="py-2.5">Reports &amp; GST</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4 space-y-4">
          <div className="bg-card rounded-2xl shadow-card p-4 flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">All Payments</Button>
            <Button variant="outline" size="sm">
              <Send className="h-4 w-4" /> Send Reminders
            </Button>
            <Button variant="outline" size="sm" className="ml-auto">Export List</Button>
          </div>

          {payments.map((p) => (
            <div key={p.id} className="bg-card rounded-2xl shadow-card p-6">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary grid place-items-center font-semibold shrink-0">
                  {p.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg">{p.client}</h3>
                  <div className="text-sm text-muted-foreground">{p.company} • {p.technology}</div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge
                      variant={p.status === "paid" ? "default" : "secondary"}
                      className={p.status === "paid" ? "bg-emerald-100 text-emerald-700 border-0" : "bg-amber-100 text-amber-700 border-0"}
                    >
                      {p.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Developer: {p.developer}</span>
                    <span className="text-xs text-muted-foreground">Sessions: {p.sessions}</span>
                    {p.overdueDays && (
                      <span className="text-xs text-rose-600 font-semibold">Overdue by {p.overdueDays} days</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Invoice: {p.invoice} • Method: {p.method} • Due: {p.due}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-600">₹{p.total.toLocaleString("en-IN")}</div>
                  <div className="text-xs text-muted-foreground">
                    Base: ₹{p.base.toLocaleString("en-IN")} + GST: ₹{p.gst.toLocaleString("en-IN")}
                  </div>
                  <div className="flex gap-2 mt-3 justify-end">
                    {p.status === "pending" && (
                      <Button size="sm" variant="outline" onClick={() => toast.success("Reminder sent")}>
                        Send Reminder
                      </Button>
                    )}
                    <Button size="sm" variant="outline">View Invoice</Button>
                    {p.status === "pending" && (
                      <Button size="sm" onClick={() => { markPaymentPaid(p.id); toast.success("Marked as paid"); }}>
                        Mark Paid
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="payouts" className="mt-4">
          <div className="bg-card rounded-2xl shadow-card p-6 space-y-3">
            {developers.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                <div>
                  <div className="font-semibold">{d.name}</div>
                  <div className="text-xs text-muted-foreground">{d.level} • {d.activeClients} active clients</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-600">₹{d.monthlyEarnings.toLocaleString("en-IN")}</div>
                  <div className="text-xs text-muted-foreground">This month</div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          <div className="bg-card rounded-2xl shadow-card p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Software Tools", value: 8500 },
              { label: "Marketing", value: 6500 },
              { label: "Operations", value: 5000 },
              { label: "Travel", value: 2000 },
              { label: "Misc", value: 1000 },
              { label: "Total Expenses", value: expenses },
            ].map((e) => (
              <div key={e.label} className="p-4 rounded-xl bg-secondary/50">
                <div className="text-xs text-muted-foreground">{e.label}</div>
                <div className="text-xl font-bold mt-1">₹{e.value.toLocaleString("en-IN")}</div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <div className="bg-card rounded-2xl shadow-card p-6 space-y-3">
            <div className="flex justify-between p-4 rounded-xl bg-secondary/50">
              <span>GST Collected (18%)</span>
              <span className="font-bold">₹{gst.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between p-4 rounded-xl bg-secondary/50">
              <span>Total Revenue</span>
              <span className="font-bold">₹{totalRevenue.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between p-4 rounded-xl bg-secondary/50">
              <span>Net Profit</span>
              <span className="font-bold text-emerald-600">₹{netProfit.toLocaleString("en-IN")}</span>
            </div>
            <Button className="w-full">Download Full GST Report</Button>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Finance;
