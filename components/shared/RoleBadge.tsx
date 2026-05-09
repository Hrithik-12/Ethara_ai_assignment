import { cn } from "@/lib/utils";
import type { Role } from "@/lib/validations";

const styles: Record<Role, string> = {
  ADMIN: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  MANAGER: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  MEMBER: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

export function RoleBadge({
  role,
  className,
}: {
  role: Role;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        styles[role],
        className
      )}
    >
      {role.toLowerCase()}
    </span>
  );
}
