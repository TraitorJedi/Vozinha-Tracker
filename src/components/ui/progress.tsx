import * as React from "react";
import { cn } from "@/lib/utils";

type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: number;
};

export function Progress({ className, value = 0, ...props }: ProgressProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("progress", className)} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeValue} {...props}>
      <div className="progress-indicator" style={{ transform: `translateX(-${100 - safeValue}%)` }} />
    </div>
  );
}
