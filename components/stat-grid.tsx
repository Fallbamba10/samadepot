import type { Stat } from "@/types";

export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-line bg-white p-4 shadow-line"
        >
          <div className="text-xs font-medium text-muted">{stat.label}</div>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="text-2xl font-bold tracking-tight text-ink">
              {stat.value}
            </div>
            {stat.trend ? (
              <div className="rounded bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-600">
                {stat.trend}
              </div>
            ) : null}
          </div>
          <div className="mt-2 text-xs text-muted">{stat.detail}</div>
        </div>
      ))}
    </section>
  );
}
