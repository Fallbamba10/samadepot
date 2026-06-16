import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet";
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition",
        variant === "primary" &&
          "bg-brand-600 text-white hover:bg-brand-500 active:bg-brand-900",
        variant === "secondary" &&
          "border border-line bg-white text-ink hover:bg-slate-50",
        variant === "quiet" && "text-muted hover:bg-slate-100 hover:text-ink",
        className
      )}
      {...props}
    />
  );
}
