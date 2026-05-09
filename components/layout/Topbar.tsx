"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { MobileSidebar } from "./MobileSidebar";

const TITLES: Array<[RegExp, string]> = [
  [/^\/dashboard\/?$/, "Dashboard"],
  [/^\/projects\/new\/?$/, "Create project"],
  [/^\/projects\/[^/]+\/settings\/?$/, "Project settings"],
  [/^\/projects\/[^/]+\/?$/, "Project"],
  [/^\/projects\/?$/, "Projects"],
  [/^\/tasks\/?$/, "My Tasks"],
  [/^\/admin\/users\/?$/, "Users"],
];

function titleFor(pathname: string) {
  for (const [pattern, title] of TITLES) {
    if (pattern.test(pathname)) return title;
  }
  return "ProjectFlow";
}

export function Topbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="grid h-9 w-9 place-items-center rounded-md text-muted hover:bg-white/5 hover:text-foreground md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>
      <h1 className="text-sm font-semibold tracking-tight">{titleFor(pathname)}</h1>
      <div className="ml-auto" />
      <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />
    </header>
  );
}
