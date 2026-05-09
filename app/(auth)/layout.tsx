import Link from "next/link";
import { CheckSquare2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left rail — branding/tagline. Hidden on mobile. */}
      <aside className="relative hidden flex-col justify-between border-r border-border bg-surface/40 p-10 lg:flex">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <CheckSquare2 className="h-4 w-4" />
          </span>
          <span className="tracking-tight">ProjectFlow</span>
        </Link>

        <div className="space-y-3 max-w-md">
          <p className="text-2xl font-semibold leading-snug tracking-tight">
            Move work forward without the overhead.
          </p>
          <p className="text-sm text-muted leading-relaxed">
            A small, focused tracker for projects, tasks, and the people who
            ship them. No bloat. No purple gradients.
          </p>
        </div>

        <p className="text-[11px] text-muted">
          © {new Date().getFullYear()} ProjectFlow · built for the Ethara.AI assessment
        </p>
      </aside>

      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <CheckSquare2 className="h-4 w-4" />
            </span>
            <span className="tracking-tight">ProjectFlow</span>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
