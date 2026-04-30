import { Calendar, UserPlus, Code2, IndianRupee } from "lucide-react";

const actions = [
  { label: "Schedule Meeting", icon: Calendar, color: "text-blue-600 bg-blue-50" },
  { label: "Add Client", icon: UserPlus, color: "text-emerald-600 bg-emerald-50" },
  { label: "Assign Developer", icon: Code2, color: "text-purple-600 bg-purple-50" },
  { label: "Process Payment", icon: IndianRupee, color: "text-orange-600 bg-orange-50" },
];

export const QuickActions = () => (
  <section className="bg-card rounded-2xl shadow-card p-6">
    <h3 className="font-bold text-lg">Quick Actions</h3>
    <p className="text-sm text-muted-foreground mb-5">Common tasks and shortcuts</p>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <button
            key={a.label}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary hover:shadow-card transition-all"
          >
            <span className={`h-11 w-11 rounded-xl grid place-items-center ${a.color}`}>
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium text-center">{a.label}</span>
          </button>
        );
      })}
    </div>
  </section>
);
