import { cn } from "@/lib/utils";

interface StatCardProps {
  value: string;
  label: string;
  variant: "blue" | "green" | "purple" | "orange";
}

const variants = {
  blue: "bg-stat-blue",
  green: "bg-stat-green",
  purple: "bg-stat-purple",
  orange: "bg-stat-orange",
};

export const StatCard = ({ value, label, variant }: StatCardProps) => (
  <div
    className={cn(
      "rounded-2xl p-6 text-white shadow-stat transition-transform hover:-translate-y-0.5",
      variants[variant]
    )}
  >
    <div className="text-3xl md:text-4xl font-bold tracking-tight">{value}</div>
    <div className="mt-1 text-sm font-medium opacity-95">{label}</div>
  </div>
);
