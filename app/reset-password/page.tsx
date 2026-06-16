import { Suspense } from "react";
import { ResetPasswordClient } from "./reset-password-client";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-md">
        <Suspense fallback={null}>
          <ResetPasswordClient />
        </Suspense>
      </div>
    </main>
  );
}
