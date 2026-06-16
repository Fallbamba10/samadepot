import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, FileArchive } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getSpaces } from "@/lib/data";
import { SubmitForm } from "./submit-form";

export default async function SubmitPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const spaces = await getSpaces();
  const space = spaces.find((item) => item.id === id);

  if (!space) {
    notFound();
  }

  return (
    <AppShell active="Espaces">
      <Link
        href="/spaces"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux espaces
      </Link>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-lg border border-line bg-white p-4 shadow-line">
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            {space.type} · {space.targetLevel}
          </div>
          <h1 className="mt-2 text-2xl font-bold text-ink">{space.title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            {space.department} · {space.teacher}
          </p>

          <div className="mt-5 grid gap-3 text-sm text-muted">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-saffron-500" />
              Deadline: {space.deadline}
            </div>
            <div className="flex items-center gap-2">
              <FileArchive className="h-4 w-4 text-lagoon-500" />
              {space.formats.join(", ")} · max {space.maxSizeMb} Mo
            </div>
          </div>
        </section>

        <SubmitForm
          spaceId={space.id}
          space={{ id: space.id, formats: space.formats, maxSizeMb: space.maxSizeMb }}
        />
      </div>
    </AppShell>
  );
}
