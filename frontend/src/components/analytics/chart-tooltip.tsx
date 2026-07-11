interface ChartTooltipPayloadEntry {
  dataKey?: string | number;
  name?: string | number;
  value?: string | number;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayloadEntry[];
  label?: string | number;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-xs shadow-xl">
      {label !== undefined && <p className="mb-1 font-medium">{label}</p>}
      {payload.map((entry, i) => (
        <p key={`${entry.dataKey}-${i}`} className="flex items-center gap-1.5" style={{ color: entry.color }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: entry.color }} />
          {entry.name}: <span className="font-medium text-foreground">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}
