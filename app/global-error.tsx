"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0, background: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ width: "100%", maxWidth: "400px", textAlign: "center" }}>
            <p style={{ fontSize: "64px", fontWeight: 800, color: "#fecaca", margin: "0 0 8px", fontFamily: "monospace" }}>500</p>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: "0 0 12px" }}>Erreur critique</h1>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 32px", lineHeight: 1.6 }}>
              Une erreur inattendue s&apos;est produite. Veuillez recharger la page.
            </p>
            <button
              onClick={reset}
              style={{ background: "#2563eb", color: "#fff", padding: "12px 24px", borderRadius: "12px", border: "none", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
            >
              Recharger
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
