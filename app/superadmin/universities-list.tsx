"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import { UniCard } from "./uni-card";

type UniversityRow = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  is_active: boolean;
  max_storage_gb: number;
  used_storage_mb: number;
  totalStudents: number;
  totalTeachers: number;
  totalSubmissions: number;
};

export function UniversitiesList({ initialUniversities }: { initialUniversities: UniversityRow[] }) {
  const [universities, setUniversities] = useState(initialUniversities);

  function handleDeleted(id: string) {
    setUniversities((prev) => prev.filter((u) => u.id !== id));
  }

  if (universities.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center">
        <Building2 className="mx-auto h-8 w-8 text-muted" />
        <p className="mt-3 text-sm font-semibold text-ink">Aucune université</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {universities.map((uni) => (
        <UniCard key={uni.id} uni={uni} onDeleted={handleDeleted} />
      ))}
    </div>
  );
}
