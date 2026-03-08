import { cn } from "@/lib/utils";

function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-border", className)} aria-hidden="true" />;
}

export { Separator };
