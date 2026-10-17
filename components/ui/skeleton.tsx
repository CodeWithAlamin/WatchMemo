import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="skeleton"
      className={cn("loading-shimmer rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
