import { cn } from "@/lib/utils";
import type { TaskStatus, TaskPriority } from "@/lib/validations";

const status: Record<TaskStatus, { label: string; dot: string; cls: string }> = {
  TODO: {
    label: "To Do",
    dot: "bg-slate-400",
    cls: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  },
  IN_PROGRESS: {
    label: "In Progress",
    dot: "bg-blue-400",
    cls: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  },
  IN_REVIEW: {
    label: "In Review",
    dot: "bg-amber-400",
    cls: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  DONE: {
    label: "Done",
    dot: "bg-emerald-400",
    cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
};

const priority: Record<TaskPriority, string> = {
  LOW: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  MEDIUM: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  HIGH: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  URGENT: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export function StatusBadge({ value }: { value: TaskStatus }) {
  const s = status[value];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-medium",
        s.cls
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

export function PriorityBadge({ value }: { value: TaskPriority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        priority[value]
      )}
    >
      {value.toLowerCase()}
    </span>
  );
}
