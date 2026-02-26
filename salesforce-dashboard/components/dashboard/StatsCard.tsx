import { TrendingUp, TrendingDown } from "lucide-react";
import { clsx } from "clsx";
import type { OrgStat } from "@/lib/types";

interface StatsCardProps extends OrgStat {
  icon: React.ReactNode;
  color?: "teal" | "blue" | "purple" | "orange";
}

const colorMap = {
  teal:   { bg: "bg-primary-50",  icon: "text-primary-600",  delta: "text-primary-600" },
  blue:   { bg: "bg-blue-50",     icon: "text-blue-600",     delta: "text-blue-600" },
  purple: { bg: "bg-purple-50",   icon: "text-purple-600",   delta: "text-purple-600" },
  orange: { bg: "bg-orange-50",   icon: "text-orange-600",   delta: "text-orange-600" },
};

export default function StatsCard({ label, value, delta, unit, icon, color = "teal" }: StatsCardProps) {
  const c      = colorMap[color];
  const isUp   = (delta ?? 0) >= 0;
  const deltaAbs = Math.abs(delta ?? 0);

  return (
    <div className="card p-5 flex items-start gap-4 hover:shadow-md transition-shadow duration-200">
      {/* Icon */}
      <div className={clsx("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", c.bg)}>
        <span className={c.icon}>{icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-neutral-500 font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold text-neutral-900 leading-none">
          {value.toLocaleString()}
          <span className="text-sm font-medium text-neutral-400 ml-1">{unit}</span>
        </p>

        {delta !== undefined && (
          <div className={clsx("flex items-center gap-1 mt-1.5 text-xs font-medium", isUp ? "text-emerald-600" : "text-red-500")}>
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{isUp ? "+" : "-"}{deltaAbs} 先週比</span>
          </div>
        )}
      </div>
    </div>
  );
}
