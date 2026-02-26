interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export default function Tooltip({ text, children, position = "bottom" }: TooltipProps) {
  const posClass = {
    top:    "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left:   "right-full top-1/2 -translate-y-1/2 mr-2",
    right:  "left-full top-1/2 -translate-y-1/2 ml-2",
  }[position];

  return (
    <div className="relative group/tooltip">
      {children}
      <div className={`absolute ${posClass} z-50 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150`}>
        <div className="bg-neutral-900 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
          {text}
        </div>
      </div>
    </div>
  );
}
