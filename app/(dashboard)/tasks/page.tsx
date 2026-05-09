"use client";

import * as React from "react";
import { CheckSquare2 } from "lucide-react";
import { TaskTable, type TaskRow } from "@/components/tasks/TaskTable";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { TaskPriority, TaskStatus } from "@/lib/validations";

type Filter<T extends string> = "ALL" | T;

const ORDER_BY: Array<{ value: string; label: string }> = [
  { value: "newest", label: "Newest first" },
  { value: "deadline", label: "Soonest deadline" },
  { value: "priority", label: "Highest priority" },
];

const PRIORITY_RANK: Record<TaskPriority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export default function MyTasksPage() {
  const { user } = useUser();
  const [tasks, setTasks] = React.useState<TaskRow[] | null>(null);
  const [status, setStatus] = React.useState<Filter<TaskStatus>>("ALL");
  const [priority, setPriority] = React.useState<Filter<TaskPriority>>("ALL");
  const [order, setOrder] = React.useState("newest");

  const fetchAll = React.useCallback(async () => {
    const r = await api<{ tasks: TaskRow[] }>("/api/tasks");
    setTasks(r.tasks);
  }, []);

  React.useEffect(() => {
    fetchAll().catch(() => setTasks([]));
  }, [fetchAll]);

  const filtered = React.useMemo(() => {
    if (!tasks) return null;
    let list = tasks;
    if (status !== "ALL") list = list.filter((t) => t.status === status);
    if (priority !== "ALL") list = list.filter((t) => t.priority === priority);
    if (order === "deadline") {
      list = [...list].sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.localeCompare(b.deadline);
      });
    } else if (order === "priority") {
      list = [...list].sort(
        (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
      );
    }
    return list;
  }, [tasks, status, priority, order]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">My Tasks</h2>
          <p className="text-xs text-muted">
            Tasks assigned to you across every project.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v as Filter<TaskStatus>)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="IN_REVIEW">In Review</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={priority}
            onValueChange={(v) => setPriority(v as Filter<TaskPriority>)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All priorities</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={order} onValueChange={setOrder}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_BY.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered === null ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 && tasks?.length === 0 ? (
        <EmptyState
          icon={<CheckSquare2 />}
          title="Nothing on your plate"
          description="When someone assigns you a task, it'll show up here."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No tasks match those filters"
          description="Try clearing one of the filters above."
        />
      ) : (
        <TaskTable
          tasks={filtered}
          canManage={false}
          currentUserId={user?.id}
          onChanged={fetchAll}
          showProject
        />
      )}
    </div>
  );
}
