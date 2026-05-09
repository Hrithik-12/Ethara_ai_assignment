import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatsCard({
  label,
  value,
  hint,
  emphasis,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  emphasis?: "warn" | "danger";
  icon?: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
          {label}
        </p>
        {icon ? (
          <span className="grid h-7 w-7 place-items-center rounded-md bg-white/5 text-muted [&_svg]:size-3.5">
            {icon}
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          "mt-2 text-2xl font-semibold tabular-nums tracking-tight",
          emphasis === "warn" && "text-warning",
          emphasis === "danger" && "text-danger"
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 text-[11px] text-muted">{hint}</p>
      ) : null}
    </Card>
  );
}
