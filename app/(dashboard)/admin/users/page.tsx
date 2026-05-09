"use client";

import * as React from "react";
import { format } from "date-fns";
import { Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { useUser } from "@/context/AuthContext";
import { ApiError, api } from "@/lib/api";
import type { Role } from "@/lib/validations";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string | null;
  created_at: string;
};

export default function AdminUsersPage() {
  const { user } = useUser();
  const [users, setUsers] = React.useState<AdminUser[] | null>(null);
  const [query, setQuery] = React.useState("");
  const [deleting, setDeleting] = React.useState<AdminUser | null>(null);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const fetchAll = React.useCallback(async () => {
    const r = await api<{ users: AdminUser[] }>("/api/users?admin=1");
    setUsers(r.users);
  }, []);

  React.useEffect(() => {
    fetchAll().catch(() => setUsers([]));
  }, [fetchAll]);

  const filtered = React.useMemo(() => {
    if (!users) return null;
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, query]);

  async function changeRole(target: AdminUser, role: Role) {
    setUpdatingId(target.id);
    try {
      await api(`/api/users/${target.id}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      toast.success(`${target.name} is now ${role.toLowerCase()}`);
      await fetchAll();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await api(`/api/users/${deleting.id}`, { method: "DELETE" });
      toast.success("User deleted");
      await fetchAll();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not delete");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Users</h2>
          <p className="text-xs text-muted">
            Manage roles, remove accounts. Be careful.
          </p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users…"
            className="w-64 pl-8"
          />
        </div>
      </div>

      {filtered === null ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No users match" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface/60 text-left text-[11px] font-medium uppercase tracking-wider text-muted">
              <tr>
                <th className="py-2.5 pl-4 pr-3">User</th>
                <th className="px-3 py-2.5">Role</th>
                <th className="px-3 py-2.5">Joined</th>
                <th className="py-2.5 pl-3 pr-4 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => {
                const isSelf = u.id === user?.id;
                return (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 pl-4 pr-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} src={u.avatar} size={32} />
                        <div>
                          <div className="font-medium leading-snug">
                            {u.name}
                            {isSelf ? (
                              <span className="ml-1.5 rounded bg-white/5 px-1 py-0.5 text-[10px] text-muted">
                                you
                              </span>
                            ) : null}
                          </div>
                          <div className="text-[11px] text-muted">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Select
                        value={u.role}
                        onValueChange={(v) => changeRole(u, v as Role)}
                        disabled={isSelf || updatingId === u.id}
                      >
                        <SelectTrigger className="h-7 w-32 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MEMBER">Member</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted">
                      {format(new Date(u.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={isSelf}
                        onClick={() => setDeleting(u)}
                        title={
                          isSelf ? "You can't delete yourself" : "Delete user"
                        }
                      >
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete this user?"
        description={
          deleting
            ? `${deleting.name}'s account and any owned projects' ownership will be cleared. Tasks they were assigned will become unassigned.`
            : ""
        }
        confirmLabel="Delete user"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
