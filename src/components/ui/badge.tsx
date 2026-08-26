import { cn } from "@/lib/utils";

type Tone = "neutral" | "positive" | "negative" | "warning" | "primary";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted",
  positive: "bg-positive-soft text-positive",
  negative: "bg-negative-soft text-negative",
  warning: "bg-warning-soft text-warning",
  primary: "bg-primary-soft text-primary",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
