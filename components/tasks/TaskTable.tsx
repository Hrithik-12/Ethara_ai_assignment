"use client";

import * as React from "react";
import { format, formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriorityBadge, StatusBadge } from "@/components/tasks/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ApiError, api } from "@/lib/api";
import { cn, isOverdue } from "@/lib/utils";
import type { TaskStatus } from "@/lib/validations";

export type TaskRow = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  deadline: string | null;
  assignee_id: string | null;
  assignee: { id: string; name: string; avatar: string | null } | null;
  project?: { id: string; name: string } | null;
};

type Props = {
  tasks: TaskRow[];
  onChanged: () => void;
  onEdit?: (task: TaskRow) => void;
  /** If true: includes a "Project" column. */
  showProject?: boolean;
  /** Whether the current user can edit/delete tasks (MANAGER/ADMIN). */
  canManage?: boolean;
  /** Current user's id — used to gate status edits for MEMBER role. */
  currentUserId?: string;
};

const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

export function TaskTable({
  tasks,
  onChanged,
  onEdit,
  showProject,
  canManage,
  currentUserId,
}: Props) {
  const [deleting, setDeleting] = React.useState<TaskRow | null>(null);

  async function changeStatus(task: TaskRow, status: TaskStatus) {
    try {
      await api(`/api/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update");
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await api(`/api/tasks/${deleting.id}`, { method: "DELETE" });
      toast.success("Task deleted");
      onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not delete");
    }
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-surface/60 text-left text-[11px] font-medium uppercase tracking-wider text-muted">
            <tr>
              <th className="py-2.5 pl-4 pr-3">Task</th>
              {showProject ? <th className="px-3 py-2.5">Project</th> : null}
              <th className="px-3 py-2.5">Assignee</th>
              <th className="px-3 py-2.5">Priority</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Deadline</th>
              <th className="px-3 py-2.5 text-right pr-4">{canManage ? "" : ""}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tasks.map((t) => {
              const overdue = isOverdue(t.deadline);
              const canEditOwn =
                canManage || (currentUserId && t.assignee_id === currentUserId);
              return (
                <tr
                  key={t.id}
                  className="group transition-colors hover:bg-white/[0.02]"
                >
                  <td className="py-3 pl-4 pr-3">
                    <div className="font-medium leading-snug">{t.title}</div>
                    {t.description ? (
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-muted">
                        {t.description}
                      </p>
                    ) : null}
                  </td>
                  {showProject ? (
                    <td className="px-3 py-3 text-xs text-muted">
                      {t.project?.name ?? "—"}
                    </td>
                  ) : null}
                  <td className="px-3 py-3">
                    {t.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={t.assignee.name}
                          src={t.assignee.avatar}
                          size={22}
                        />
                        <span className="text-xs">{t.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted">Unassigned</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <PriorityBadge value={t.priority} />
                  </td>
                  <td className="px-3 py-3">
                    {canEditOwn ? (
                      <Select
                        value={t.status}
                        onValueChange={(v) => changeStatus(t, v as TaskStatus)}
                      >
                        <SelectTrigger className="h-7 w-32 border-transparent bg-transparent px-1 text-xs hover:border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) =>
                                c.toUpperCase()
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <StatusBadge value={t.status} />
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs">
                    {t.deadline ? (
                      <span
                        className={cn(
                          "tabular-nums",
                          overdue ? "text-danger" : "text-muted"
                        )}
                        title={
                          overdue
                            ? `Overdue · ${formatDistanceToNow(
                                new Date(t.deadline)
                              )} ago`
                            : undefined
                        }
                      >
                        {format(new Date(t.deadline), "MMM d")}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="py-3 pl-3 pr-4 text-right">
                    {canManage ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => onEdit?.(t)}>
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            danger
                            onSelect={() => setDeleting(t)}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete this task?"
        description={
          deleting ? `"${deleting.title}" will be permanently removed.` : ""
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </>
  );
}
