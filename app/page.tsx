// Proxy redirects "/" → "/dashboard" or "/login", so this page is rarely
// rendered. Kept as a graceful fallback.
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();
  redirect(user ? "/dashboard" : "/login");
}
