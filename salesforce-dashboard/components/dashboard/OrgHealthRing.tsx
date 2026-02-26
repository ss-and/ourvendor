import { clsx } from "clsx";
import type { OrgHealth } from "@/lib/types";

interface OrgHealthRingProps extends OrgHealth {}

const statusConfig = {
  good:   { stroke: "#00B4A8", text: "text-primary-600",  bg: "bg-primary-50",  label: "正常" },
  warn:   { stroke: "#F59E0B", text: "text-amber-600",    bg: "bg-amber-50",    label: "注意" },
  danger: { stroke: "#EF4444", text: "text-red-600",      bg: "bg-red-50",      label: "警告" },
};

export default function OrgHealthRing({ label, percent, status, description }: OrgHealthRingProps) {
  const cfg = statusConfig[status];

  // SVG ring parameters
  const size       = 80;
  const strokeW    = 8;
  const radius     = (size - strokeW) / 2;
  const circumf    = 2 * Math.PI * radius;
  const dashOffset = circumf * (1 - percent / 100);

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-neutral-50 transition-colors">
      {/* SVG Ring */}
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#E5E7EB" strokeWidth={strokeW}
          />
          {/* Progress */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={cfg.stroke}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeDasharray={circumf}
            strokeDashoffset={dashOffset}
            className="ring-progress transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={clsx("text-base font-bold", cfg.text)}>
            {percent}%
          </span>
        </div>
      </div>

      {/* Labels */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-neutral-800">{label}</p>
          <span className={clsx("badge text-[10px]", cfg.bg, cfg.text)}>
            {cfg.label}
          </span>
        </div>
        <p className="text-xs text-neutral-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
