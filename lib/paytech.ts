import crypto from "crypto";

const PAYTECH_API_URL = "https://paytech.sn/api/payment/request-payment";

export type PlanId = "basic" | "premium";

export const PLAN_PRICES: Record<PlanId, { label: string; priceFcfa: number }> = {
  basic:   { label: "Plan Basic",   priceFcfa: 15_000 },
  premium: { label: "Plan Premium", priceFcfa: 35_000 },
};

export type PaytechInitResult =
  | { success: true; redirectUrl: string; token: string }
  | { success: false; error: string };

export async function initiatePayment({
  plan,
  universityId,
  universityName,
  refCommand,
}: {
  plan: PlanId;
  universityId: string;
  universityName: string;
  refCommand: string;
}): Promise<PaytechInitResult> {
  const apiKey    = process.env.PAYTECH_API_KEY;
  const apiSecret = process.env.PAYTECH_API_SECRET;
  const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL ?? "https://samadepot.app";

  if (!apiKey || !apiSecret) {
    return { success: false, error: "PayTech non configuré." };
  }

  const planInfo = PLAN_PRICES[plan];

  // PayTech rejette localhost — en dev on utilise une URL factice valide
  const isLocalhost = siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1");
  const callbackBase = isLocalhost ? "https://samadepot.app" : siteUrl;

  // Nettoyer le nom de l'université (caractères spéciaux interdits dans command_name)
  const safeUniversityName = universityName.replace(/[^a-zA-Z0-9\s\-]/g, "").trim();

  const body = {
    item_name:    planInfo.label,
    item_price:   planInfo.priceFcfa,
    currency:     "XOF",
    ref_command:  refCommand,
    command_name: `Abonnement ${planInfo.label} - ${safeUniversityName}`,
    env:          process.env.NODE_ENV === "production" ? "prod" : "test",
    ipn_url:      `${callbackBase}/api/payment/webhook`,
    success_url:  `${callbackBase}/payment/success?ref=${refCommand}`,
    cancel_url:   `${callbackBase}/payment/cancel`,
    custom_field: JSON.stringify({ university_id: universityId, plan }),
  };

  const res = await fetch(PAYTECH_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      API_KEY:         apiKey,
      API_SECRET:      apiSecret,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("[PayTech] HTTP", res.status, errText);
    return { success: false, error: `PayTech HTTP ${res.status}: ${errText}` };
  }

  const data = await res.json();

  if (data.success !== 1 || !data.redirect_url) {
    return { success: false, error: data.error ?? "Réponse PayTech invalide." };
  }

  return { success: true, redirectUrl: data.redirect_url, token: data.token };
}

// Génère une ref unique : SD-{universityId[:8]}-{timestamp}
export function generateRef(universityId: string): string {
  return `SD-${universityId.slice(0, 8).toUpperCase()}-${Date.now()}`;
}

// Vérifie la signature HMAC du webhook IPN
export function verifyWebhookSignature(
  payload: { amount: number; ref_command: string; api_key_sha256: string; api_secret_sha256: string }
): boolean {
  const apiKey    = process.env.PAYTECH_API_KEY ?? "";
  const apiSecret = process.env.PAYTECH_API_SECRET ?? "";

  const expectedKeyHash    = crypto.createHash("sha256").update(apiKey).digest("hex");
  const expectedSecretHash = crypto.createHash("sha256").update(apiSecret).digest("hex");

  return (
    payload.api_key_sha256    === expectedKeyHash &&
    payload.api_secret_sha256 === expectedSecretHash
  );
}
