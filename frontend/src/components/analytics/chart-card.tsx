import { type ReactNode } from "react";

export function ChartCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass rounded-2xl p-5 ${className ?? ""}`}>
      <h3 className="text-sm font-medium">{title}</h3>
      {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      <div className="mt-4 h-72 w-full">{children}</div>
    </div>
  );
}
