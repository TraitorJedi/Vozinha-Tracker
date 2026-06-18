import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
};

const buttonVariants = {
  variant: {
    default: "btn btn-default",
    outline: "btn btn-outline",
    ghost: "btn btn-ghost"
  },
  size: {
    default: "btn-size-default",
    sm: "btn-size-sm",
    lg: "btn-size-lg",
    icon: "btn-size-icon"
  }
};

export function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants.variant[variant], buttonVariants.size[size], className)}
      {...props}
    />
  );
}
