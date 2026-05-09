"use client";

import * as React from "react";
import { Search, UserPlus2, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ApiError, api } from "@/lib/api";
import type { Role } from "@/lib/validations";

export type ProjectMember = {
  user_id: string;
  user: { id: string; name: string; email: string; role: Role; avatar: string | null };
};

type DirectoryUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string | null;
};

export function MemberManager({
  projectId,
  members,
  canManage,
  onChanged,
}: {
  projectId: string;
  members: ProjectMember[];
  canManage: boolean;
  onChanged: () => void;
}) {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [removing, setRemoving] = React.useState<ProjectMember | null>(null);

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted">{members.length} members</p>
          {canManage ? (
            <Button size="sm" onClick={() => setPickerOpen(true)}>
              <UserPlus2 className="h-4 w-4" />
              Add member
            </Button>
          ) : null}
        </div>

        <ul className="divide-y divide-border rounded-lg border border-border">
          {members.map((m) => (
            <li
              key={m.user_id}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02]"
            >
              <Avatar name={m.user.name} src={m.user.avatar} size={32} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{m.user.name}</p>
                <p className="truncate text-[11px] text-muted">{m.user.email}</p>
              </div>
              <RoleBadge role={m.user.role} />
              {canManage ? (
                <button
                  type="button"
                  onClick={() => setRemoving(m)}
                  className="grid h-7 w-7 place-items-center rounded text-muted hover:bg-white/5 hover:text-danger"
                  title="Remove from project"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <AddMemberDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        projectId={projectId}
        existing={new Set(members.map((m) => m.user_id))}
        onAdded={onChanged}
      />

      <ConfirmDialog
        open={!!removing}
        onOpenChange={(o) => !o && setRemoving(null)}
        title="Remove this member?"
        description={
          removing
            ? `${removing.user.name} will lose access to this project's tasks.`
            : ""
        }
        confirmLabel="Remove"
        destructive
        onConfirm={async () => {
          if (!removing) return;
          try {
            await api(`/api/projects/${projectId}/members`, {
              method: "DELETE",
              body: JSON.stringify({ userId: removing.user_id }),
            });
            toast.success("Removed");
            onChanged();
          } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "Could not remove");
          }
        }}
      />
    </>
  );
}

function AddMemberDialog({
  open,
  onOpenChange,
  projectId,
  existing,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  existing: Set<string>;
  onAdded: () => void;
}) {
  const [users, setUsers] = React.useState<DirectoryUser[] | null>(null);
  const [query, setQuery] = React.useState("");
  const [adding, setAdding] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    let alive = true;
    api<{ users: DirectoryUser[] }>("/api/users")
      .then((r) => alive && setUsers(r.users))
      .catch(() => alive && setUsers([]));
    return () => {
      alive = false;
    };
  }, [open]);

  const candidates = React.useMemo(() => {
    if (!users) return null;
    const q = query.trim().toLowerCase();
    return users
      .filter((u) => !existing.has(u.id))
      .filter((u) =>
        q
          ? u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
          : true
      );
  }, [users, query, existing]);

  async function add(userId: string) {
    setAdding(userId);
    try {
      await api(`/api/projects/${projectId}/members`, {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      onAdded();
      toast.success("Added");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not add");
    } finally {
      setAdding(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a member</DialogTitle>
          <DialogDescription>
            Pick someone from your team. They&apos;ll get access right away.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="pl-8"
            autoFocus
          />
        </div>

        <ul className="max-h-72 divide-y divide-border overflow-y-auto rounded-md border border-border">
          {candidates === null
            ? Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="h-12 animate-pulse bg-white/[0.02]" />
              ))
            : candidates.length === 0
            ? (
              <li className="px-4 py-6 text-center text-xs text-muted">
                No matching users.
              </li>
            )
            : candidates.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.02]"
                >
                  <Avatar name={u.name} src={u.avatar} size={28} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{u.name}</p>
                    <p className="truncate text-[11px] text-muted">{u.email}</p>
                  </div>
                  <RoleBadge role={u.role} />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => add(u.id)}
                    disabled={adding === u.id}
                  >
                    {adding === u.id ? "Adding…" : "Add"}
                  </Button>
                </li>
              ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
