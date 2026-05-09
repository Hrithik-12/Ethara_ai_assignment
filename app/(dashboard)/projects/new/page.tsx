import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "New project · ProjectFlow" };

export default async function NewProjectPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "MEMBER") redirect("/projects");

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Create a project</CardTitle>
          <CardDescription>
            You&apos;ll be added as the owner and first member.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm />
        </CardContent>
      </Card>
    </div>
  );
}
