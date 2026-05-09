"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  CheckSquare,
  CalendarClock,
  FolderKanban,
  ListTodo,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/dashboard/StatsCard";
import {
  PriorityDonut,
  TaskStatusChart,
  prioritySeries,
  statusSeries,
} from "@/components/dashboard/Charts";
import { StatusBadge, PriorityBadge } from "@/components/tasks/StatusBadge";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useUser } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Role, TaskPriority, TaskStatus } from "@/lib/validations";

type StatsResponse = {
  totals: {
    projects: number;
    tasks: number;
    myOpen: number;
    myOverdue: number;
  };
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  recentMine: Array<{
    id: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    deadline: string | null;
    project: { id: string; name: string } | null;
  }>;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: Role;
    avatar: string | null;
    created_at: string;
  }>;
};

export default function DashboardPage() {
  const { user } = useUser();
  const [data, setData] = React.useState<StatsResponse | null>(null);

  React.useEffect(() => {
    let alive = true;
    api<StatsResponse>("/api/stats")
      .then((r) => alive && setData(r))
      .catch(() => alive && setData(null));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          {user ? `Hey ${user.name.split(" ")[0]},` : "Welcome,"}{" "}
          <span className="text-muted">here&apos;s where things stand.</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {!data ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] w-full" />
          ))
        ) : (
          <>
            <StatsCard
              label="Total projects"
              value={data.totals.projects}
              icon={<FolderKanban />}
            />
            <StatsCard
              label="Total tasks"
              value={data.totals.tasks}
              icon={<ListTodo />}
            />
            <StatsCard
              label="My open tasks"
              value={data.totals.myOpen}
              icon={<CheckSquare />}
              hint="Excluding done"
            />
            <StatsCard
              label="Overdue"
              value={data.totals.myOverdue}
              icon={<CalendarClock />}
              emphasis={data.totals.myOverdue > 0 ? "danger" : undefined}
              hint={
                data.totals.myOverdue === 0 ? "All clear" : "Needs attention"
              }
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Tasks by status</CardTitle>
          </CardHeader>
          <CardContent>
            {data ? (
              <TaskStatusChart data={statusSeries(data.byStatus)} />
            ) : (
              <Skeleton className="h-64 w-full" />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Priority breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {data ? (
              <PriorityDonut data={prioritySeries(data.byPriority)} />
            ) : (
              <Skeleton className="h-64 w-full" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className={`grid gap-4 ${user?.role === "ADMIN" ? "lg:grid-cols-2" : ""}`}>
        <Card>
          <CardHeader>
            <CardTitle>My recent tasks</CardTitle>
          </CardHeader>
          <CardContent className="px-0 py-0">
            {!data ? (
              <div className="space-y-2 p-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            ) : data.recentMine.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  title="Nothing assigned to you yet"
                  description="When tasks land in your queue, they'll appear here."
                />
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {data.recentMine.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.title}</p>
                      <p className="truncate text-[11px] text-muted">
                        {t.project?.name ?? "Unknown project"}
                        {t.deadline
                          ? ` · ${format(new Date(t.deadline), "MMM d")}`
                          : ""}
                      </p>
                    </div>
                    <PriorityBadge value={t.priority} />
                    <StatusBadge value={t.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {user?.role === "ADMIN" ? (
          <Card>
            <CardHeader>
              <CardTitle>Recent signups</CardTitle>
            </CardHeader>
            <CardContent className="px-0 py-0">
              {!data ? (
                <div className="space-y-2 p-5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-full" />
                  ))}
                </div>
              ) : data.recentUsers.length === 0 ? (
                <div className="p-5">
                  <EmptyState title="No signups yet" />
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {data.recentUsers.map((u) => (
                    <li
                      key={u.id}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02]"
                    >
                      <Avatar name={u.name} src={u.avatar} size={28} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">
                          <Link
                            href="/admin/users"
                            className="font-medium hover:text-primary"
                          >
                            {u.name}
                          </Link>
                        </p>
                        <p className="truncate text-[11px] text-muted">
                          {u.email}
                        </p>
                      </div>
                      <RoleBadge role={u.role} />
                      <span className="hidden text-[11px] text-muted sm:inline">
                        {format(new Date(u.created_at), "MMM d")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
