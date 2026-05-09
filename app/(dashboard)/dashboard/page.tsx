// Filled in later — for now just confirm the shell works.
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Dashboard · ProjectFlow" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold tracking-tight">
        Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
      </h2>
      <p className="text-sm text-muted">Charts and stats land here next.</p>
    </div>
  );
}
