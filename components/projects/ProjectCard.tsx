import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, Users2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { cn, isOverdue } from "@/lib/utils";

export type ProjectListItem = {
  id: string;
  name: string;
  description: string | null;
  deadline: string | null;
  member_count: number;
  tasks: { total: number; done: number };
  owner: { id: string; name: string; avatar: string | null } | null;
};

export function ProjectCard({ project }: { project: ProjectListItem }) {
  const total = project.tasks.total;
  const done = project.tasks.done;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const overdue = isOverdue(project.deadline);

  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <Card className="flex h-full flex-col p-5 transition-colors hover:border-white/15">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold tracking-tight">
              {project.name}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs text-muted">
              {project.description || "No description yet."}
            </p>
          </div>
          {project.owner ? (
            <Avatar
              name={project.owner.name}
              src={project.owner.avatar}
              size={28}
            />
          ) : null}
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-[11px] text-muted">
            <span>
              {done}/{total} tasks
            </span>
            <span>{pct}%</span>
          </div>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full bg-primary"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-4 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Users2 className="h-3.5 w-3.5" />
            {project.member_count}
          </span>
          {project.deadline ? (
            <span
              className={cn(
                "inline-flex items-center gap-1.5",
                overdue && "text-danger"
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              {format(new Date(project.deadline), "MMM d, yyyy")}
            </span>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}
