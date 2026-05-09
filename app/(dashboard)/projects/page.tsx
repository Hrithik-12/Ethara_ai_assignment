"use client";

import * as React from "react";
import Link from "next/link";
import { FolderPlus, Search, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectCard, type ProjectListItem } from "@/components/projects/ProjectCard";
import { ProjectCardSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useUser } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function ProjectsPage() {
  const { user } = useUser();
  const [projects, setProjects] = React.useState<ProjectListItem[] | null>(null);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    let alive = true;
    api<{ projects: ProjectListItem[] }>("/api/projects")
      .then((res) => {
        if (alive) setProjects(res.projects);
      })
      .catch(() => alive && setProjects([]));
    return () => {
      alive = false;
    };
  }, []);

  const canCreate = user?.role === "ADMIN" || user?.role === "MANAGER";

  const filtered = React.useMemo(() => {
    if (!projects) return null;
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
    );
  }, [projects, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Projects</h2>
          <p className="text-xs text-muted">
            {projects ? `${projects.length} total` : "Loading…"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects…"
              className="w-52 pl-8"
            />
          </div>
          {canCreate ? (
            <Button asChild size="sm">
              <Link href="/projects/new">
                <FolderPlus className="h-4 w-4" />
                New Project
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      {filtered === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 && projects?.length === 0 ? (
        <EmptyState
          icon={<FolderOpen />}
          title="No projects yet"
          description={
            canCreate
              ? "Create your first project and start organizing your team's work."
              : "You haven't been added to any projects yet. Ask a manager to invite you."
          }
          actionLabel={canCreate ? "Create project" : undefined}
          onAction={
            canCreate
              ? () => (window.location.href = "/projects/new")
              : undefined
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search />}
          title="Nothing matches that search"
          description={`No projects with "${query}". Try a different name.`}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
