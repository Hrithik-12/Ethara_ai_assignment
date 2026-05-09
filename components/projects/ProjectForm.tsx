"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, api } from "@/lib/api";

type ProjectInput = {
  id?: string;
  name?: string;
  description?: string | null;
  deadline?: string | null;
};

export function ProjectForm({
  initial,
  mode = "create",
}: {
  initial?: ProjectInput;
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  const [name, setName] = React.useState(initial?.name ?? "");
  const [description, setDescription] = React.useState(initial?.description ?? "");
  const [deadline, setDeadline] = React.useState(initial?.deadline ?? "");
  const [busy, setBusy] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);

    const body = {
      name: name.trim(),
      description: description.trim() || null,
      deadline: deadline || null,
    };

    try {
      if (mode === "edit" && initial?.id) {
        await api(`/api/projects/${initial.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        toast.success("Project updated");
        router.push(`/projects/${initial.id}`);
        router.refresh();
      } else {
        const res = await api<{ project: { id: string } }>("/api/projects", {
          method: "POST",
          body: JSON.stringify(body),
        });
        toast.success("Project created");
        router.push(`/projects/${res.project.id}`);
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save");
      setBusy(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Q3 marketing site rebuild"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={4}
          value={description ?? ""}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A short summary so people know what this project is for."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="deadline">Deadline</Label>
        <Input
          id="deadline"
          type="date"
          value={deadline ?? ""}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <p className="text-[11px] text-muted">Optional — leave blank if there&apos;s no fixed date.</p>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={busy}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : null}
          {busy ? "Saving…" : mode === "edit" ? "Save changes" : "Create project"}
        </Button>
      </div>
    </form>
  );
}
