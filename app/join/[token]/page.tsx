import { Suspense } from "react";
import { JoinClient } from "./join-client";

export default async function JoinPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-md">
        <Suspense fallback={<LoadingCard />}>
          <JoinClient token={token} />
        </Suspense>
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-soft">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
      <p className="mt-4 text-sm text-muted">Chargement…</p>
    </div>
  );
}
