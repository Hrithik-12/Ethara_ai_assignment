"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskTable, type TaskRow } from "@/components/tasks/TaskTable";
import { TaskForm } from "@/components/tasks/TaskForm";
import { MemberManager, type ProjectMember } from "@/components/projects/MemberManager";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/AuthContext";
import { ApiError, api } from "@/lib/api";
import { cn, isOverdue } from "@/lib/utils";

type ProjectDetail = {
  id: string;
  name: string;
  description: string | null;
  deadline: string | null;
  owner_id: string;
  owner: { id: string; name: string; email: string; avatar: string | null } | null;
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const [project, setProject] = React.useState<ProjectDetail | null>(null);
  const [members, setMembers] = React.useState<ProjectMember[]>([]);
  const [tasks, setTasks] = React.useState<TaskRow[] | null>(null);
  const [taskFormOpen, setTaskFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TaskRow | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [notFound, setNotFound] = React.useState(false);

  const isOwner = user?.id === project?.owner_id;
  const canManageProject = !!user && (user.role === "ADMIN" || isOwner);
  const canManageTasks =
    !!user && (user.role === "ADMIN" || user.role === "MANAGER");

  const fetchAll = React.useCallback(async () => {
    try {
      const detail = await api<{
        project: ProjectDetail;
        members: ProjectMember[];
      }>(`/api/projects/${id}`);
      setProject(detail.project);
      setMembers(detail.members);
      const t = await api<{ tasks: TaskRow[] }>(`/api/projects/${id}/tasks`);
      setTasks(t.tasks);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
        setNotFound(true);
      } else {
        toast.error(err instanceof ApiError ? err.message : "Could not load");
      }
    }
  }, [id]);

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (notFound) {
    return (
      <EmptyState
        title="Project not found"
        description="It may have been deleted, or you don't have access."
        actionLabel="Back to projects"
        onAction={() => router.push("/projects")}
      />
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const overdue = isOverdue(project.deadline);
  const memberOptions = members.map((m) => ({
    id: m.user.id,
    name: m.user.name,
  }));

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{project.name}</h2>
          {project.description ? (
            <p className="mt-1 max-w-2xl text-sm text-muted">
              {project.description}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
            {project.owner ? (
              <span className="inline-flex items-center gap-1.5">
                <Avatar
                  name={project.owner.name}
                  src={project.owner.avatar}
                  size={20}
                />
                <span>Owned by {project.owner.name}</span>
              </span>
            ) : null}
            {project.deadline ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5",
                  overdue && "text-danger"
                )}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Due {format(new Date(project.deadline), "MMM d, yyyy")}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canManageTasks ? (
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                setTaskFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add task
            </Button>
          ) : null}
          {user?.role === "ADMIN" ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4 text-danger" />
            </Button>
          ) : null}
        </div>
      </header>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">
            Tasks
            <span className="ml-1.5 text-[10px] text-muted">
              {tasks?.length ?? 0}
            </span>
          </TabsTrigger>
          <TabsTrigger value="members">
            Members
            <span className="ml-1.5 text-[10px] text-muted">
              {members.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          {tasks === null ? (
            <div className="space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              title="No tasks yet"
              description={
                canManageTasks
                  ? "Add the first one to get the team unstuck."
                  : "Once tasks are created here, they'll show up in this list."
              }
              actionLabel={canManageTasks ? "Add task" : undefined}
              onAction={
                canManageTasks
                  ? () => {
                      setEditing(null);
                      setTaskFormOpen(true);
                    }
                  : undefined
              }
            />
          ) : (
            <TaskTable
              tasks={tasks}
              canManage={canManageTasks}
              currentUserId={user?.id}
              onEdit={(task) => {
                setEditing(task);
                setTaskFormOpen(true);
              }}
              onChanged={fetchAll}
            />
          )}
        </TabsContent>

        <TabsContent value="members">
          <MemberManager
            projectId={project.id}
            members={members}
            canManage={canManageProject}
            onChanged={fetchAll}
          />
        </TabsContent>
      </Tabs>

      <TaskForm
        open={taskFormOpen}
        onOpenChange={setTaskFormOpen}
        projectId={project.id}
        members={memberOptions}
        initial={
          editing
            ? {
                id: editing.id,
                title: editing.title,
                description: editing.description ?? "",
                priority: editing.priority,
                status: editing.status,
                deadline: editing.deadline,
                assignee_id: editing.assignee_id,
              }
            : undefined
        }
        onSaved={fetchAll}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this project?"
        description="All tasks and member assignments will also be removed. This can't be undone."
        confirmLabel="Delete project"
        destructive
        onConfirm={async () => {
          try {
            await api(`/api/projects/${project.id}`, { method: "DELETE" });
            toast.success("Project deleted");
            router.push("/projects");
            router.refresh();
          } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "Could not delete");
          }
        }}
      />
    </div>
  );
}
