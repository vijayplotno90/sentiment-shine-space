import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tasks = [
  {
    title: "Java Training Session with Raj Kumar",
    time: "10:00 AM",
    meta: ["Client: Raj Kumar", "Dev: Amit Sharma"],
    priority: "high",
    action: "Join",
  },
  {
    title: "Check progress on Tableau project",
    time: "2:00 PM",
    meta: ["Client: Priya Singh", "Dev: Neha Gupta"],
    priority: "medium",
    action: "Update",
  },
  {
    title: "Payment reminder - Power BI training",
    time: "4:00 PM",
    meta: ["Client: Rohit Patel", "₹15,000"],
    priority: "high",
    action: "Send Reminder",
  },
];

export const PriorityTasks = () => (
  <section className="bg-card rounded-2xl shadow-card p-6">
    <div className="flex items-center gap-2 mb-1">
      <Calendar className="h-5 w-5 text-primary" />
      <h2 className="text-xl font-bold">Today's Priority Tasks</h2>
    </div>
    <p className="text-sm text-muted-foreground mb-5">
      Your agenda for Thursday, April 30, 2026
    </p>
    <ul className="space-y-3">
      {tasks.map((t, i) => (
        <li
          key={i}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors"
        >
          <div className="flex items-start gap-3 flex-1">
            <span className="mt-2 h-2 w-2 rounded-full bg-primary shrink-0" />
            <div>
              <div className="font-semibold">{t.title}</div>
              <div className="mt-1 text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-1">
                <span>{t.time}</span>
                {t.meta.map((m, j) => (
                  <span key={j}>• {m}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:ml-4">
            <Badge
              variant={t.priority === "high" ? "destructive" : "secondary"}
              className={cn("capitalize", t.priority === "medium" && "bg-muted text-foreground")}
            >
              {t.priority}
            </Badge>
            <Button size="sm" variant="outline">{t.action}</Button>
          </div>
        </li>
      ))}
    </ul>
  </section>
);
