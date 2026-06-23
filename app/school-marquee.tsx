"use client";

const SCHOOLS = [
  { initials: "UCAD", name: "Univ. Cheikh Anta Diop", color: "#14683C" },
  { initials: "ISM", name: "ISM Dakar", color: "#2563EB" },
  { initials: "SA", name: "Sonatel Academy", color: "#D97706" },
  { initials: "UGB", name: "Univ. Gaston Berger", color: "#7C3AED" },
  { initials: "CESAG", name: "CESAG", color: "#DC2626" },
  { initials: "CTIC", name: "CTIC Dakar", color: "#0891B2" },
  { initials: "UAD", name: "Univ. Alioune Diop", color: "#059669" },
  { initials: "ESP", name: "ESP Dakar", color: "#D97706" },
  { initials: "IDE", name: "IDE Dakar", color: "#DB2777" },
  { initials: "UdT", name: "Univ. de Thiès", color: "#14683C" },
  { initials: "SIM", name: "SUP'iMANAGEMENT", color: "#7C3AED" },
  { initials: "UASZ", name: "UASZ Ziguinchor", color: "#2563EB" },
  { initials: "ISEG", name: "ISEG", color: "#DC2626" },
  { initials: "3iL", name: "3iL Sénégal", color: "#0891B2" },
];

// double pour la boucle infinie
const ITEMS = [...SCHOOLS, ...SCHOOLS];

export function SchoolMarquee() {
  return (
    <div className="border-y border-slate-100 bg-white py-5 overflow-hidden">
      <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
        Conçu pour les institutions comme les vôtres
      </p>
      <div
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "2.5rem",
            width: "max-content",
            animation: "sd-marquee 35s linear infinite",
          }}
        >
          {ITEMS.map((school, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexShrink: 0 }}
            >
              {/* Logo pastille */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: school.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    color: "#fff",
                    fontSize: school.initials.length > 3 ? 9 : 11,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  {school.initials}
                </span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#475569", whiteSpace: "nowrap" }}>
                {school.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* keyframe défini en inline style global */}
      <style>{`
        @keyframes sd-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
