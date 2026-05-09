import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-white/5 px-2 py-0.5 text-[11px] font-medium leading-none",
        className
      )}
      {...props}
    />
  );
}
