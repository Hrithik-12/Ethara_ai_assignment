"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn, colorFor, initials } from "@/lib/utils";

export function Avatar({
  name,
  src,
  size = 32,
  className,
}: {
  name?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const dim = `${size}px`;
  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full text-[11px] font-medium",
        className
      )}
      style={{ width: dim, height: dim }}
    >
      {src ? (
        <AvatarPrimitive.Image
          src={src}
          alt={name ?? ""}
          className="h-full w-full object-cover"
        />
      ) : null}
      <AvatarPrimitive.Fallback
        delayMs={200}
        className={cn(
          "flex h-full w-full items-center justify-center",
          colorFor(name ?? "?")
        )}
      >
        {initials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
