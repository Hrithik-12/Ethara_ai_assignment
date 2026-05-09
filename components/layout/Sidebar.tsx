"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users2,
  LogOut,
  CheckSquare2,
} from "lucide-react";
import { useUser } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/tasks", label: "My Tasks", icon: CheckSquare },
  { href: "/admin/users", label: "Users", icon: Users2, adminOnly: true },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useUser();

  const items = NAV.filter((item) => !item.adminOnly || user?.role === "ADMIN");

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-surface/40">
      <div className="px-4 pt-5 pb-4">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="inline-flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <CheckSquare2 className="h-4 w-4" />
          </span>
          <span>ProjectFlow</span>
        </Link>
      </div>

      <nav className="flex-1 px-2 py-2">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-white/[0.04] text-foreground"
                      : "text-foreground/70 hover:bg-white/[0.03] hover:text-foreground"
                  )}
                >
                  {active ? (
                    <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary" />
                  ) : null}
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active ? "text-primary" : "text-muted"
                    )}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {user ? (
        <div className="border-t border-border px-3 py-3">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} src={user.avatar} size={32} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-medium">{user.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="truncate text-[11px] text-muted">{user.email}</p>
                <RoleBadge role={user.role} className="ml-auto" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onNavigate?.();
                logout();
              }}
              title="Sign out"
              className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-white/[0.05] hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
