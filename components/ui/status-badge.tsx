import type { SubmissionStatus } from "@/types";
import { cn } from "@/lib/utils";

const labels: Record<SubmissionStatus, string> = {
  received: "Recu",
  read: "Lu",
  validated: "Valide",
  graded: "Note",
  returned: "Retourne",
  rejected: "Rejete",
  late: "En retard"
};

const variants: Record<SubmissionStatus, string> = {
  received: "bg-lagoon-50 text-lagoon-500",
  read: "bg-slate-100 text-slate-700",
  validated: "bg-brand-50 text-brand-600",
  graded: "bg-saffron-50 text-saffron-500",
  returned: "bg-coral-50 text-coral-500",
  rejected: "bg-red-50 text-red-700",
  late: "bg-red-50 text-red-700"
};

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium",
        variants[status]
      )}
    >
      {labels[status]}
    </span>
  );
}
