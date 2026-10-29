import { createFileRoute } from "@tanstack/react-router";

// Creates a Stripe Billing Portal session ("Manage subscription").
// No database: the customer is derived server-side from an id the client
// already holds (Checkout session, Subscription or Subscription Item), so a
// client can't pass an arbitrary customer id and open someone else's portal.

const REF = /^(?:cs_(?:test|live)|sub|si)_[A-Za-z0-9]{6,200}$/;

function trustedOrigin(request: Request) {
  const fromEnv = process.env["APP_ORIGIN"];
  if (fromEnv && /^https:\/\/[a-z0-9.-]+$/i.test(fromEnv)) return fromEnv;
  try {
    const own = new URL(request.url).origin;
    if (/^https:\/\//i.test(own)) return own;
  } catch {
    /* ignore */
  }
  return "https://epilumina.vercel.app";
}

type Resolved = { customer?: string; error?: string; status?: number };

/** Zamienia dowolny identyfikator zakupu na id klienta Stripe. */
async function resolveCustomer(ref: string, secret: string): Promise<Resolved> {
  const auth = { Authorization: `Bearer ${secret}` };
  const get = async (path: string) => {
    const res = await fetch(`https://api.stripe.com/v1/${path}`, { headers: auth });
    if (res.status === 404) return { notFound: true as const };
    if (!res.ok) return { failed: true as const };
    return { data: (await res.json()) as Record<string, any> };
  };
  const customerOf = (obj: any): string =>
    typeof obj?.customer === "string" ? obj.customer : (obj?.customer?.id ?? "");

  if (ref.startsWith("cs_")) {
    const r = await get(`checkout/sessions/${encodeURIComponent(ref)}`);
    if (r.notFound) return { error: "not found", status: 404 };
    if (r.failed) return { error: "stripe unavailable", status: 502 };
    const s = r.data!;
    const customer = customerOf(s);
    if (s.status !== "complete" || !customer) return { error: "no subscription", status: 404 };
    return { customer };
  }

  if (ref.startsWith("si_")) {
    const item = await get(`subscription_items/${encodeURIComponent(ref)}`);
    if (item.notFound) return { error: "not found", status: 404 };
    if (item.failed) return { error: "stripe unavailable", status: 502 };
    const subId =
      typeof item.data?.subscription === "string"
        ? item.data.subscription
        : (item.data?.subscription?.id ?? "");
    if (!subId) return { error: "no subscription", status: 404 };
    const sub = await get(`subscriptions/${encodeURIComponent(subId)}`);
    if (sub.notFound) return { error: "not found", status: 404 };
    if (sub.failed) return { error: "stripe unavailable", status: 502 };
    const customer = customerOf(sub.data);
    if (!customer) return { error: "no subscription", status: 404 };
    return { customer };
  }

  // sub_
  const sub = await get(`subscriptions/${encodeURIComponent(ref)}`);
  if (sub.notFound) return { error: "not found", status: 404 };
  if (sub.failed) return { error: "stripe unavailable", status: 502 };
  const customer = customerOf(sub.data);
  if (!customer) return { error: "no subscription", status: 404 };
  return { customer };
}

export const Route = createFileRoute("/api/create-portal-session")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["STRIPE_SECRET_KEY"];
        if (!secret) return Response.json({ error: "not configured" }, { status: 500 });

        let ref = "";
        try {
          const body = (await request.json()) as { sessionId?: unknown; ref?: unknown };
          const raw = body?.sessionId ?? body?.ref;
          if (typeof raw === "string") ref = raw.trim();
        } catch {
          /* invalid body */
        }
        if (!REF.test(ref)) {
          return Response.json({ error: "invalid id", code: "invalid_id" }, { status: 400 });
        }

        const resolved = await resolveCustomer(ref, secret);
        if (!resolved.customer) {
          return Response.json(
            { error: resolved.error || "not found", code: "no_subscription" },
            { status: resolved.status || 404 },
          );
        }

        const form = new URLSearchParams();
        form.set("customer", resolved.customer);
        form.set("return_url", `${trustedOrigin(request)}/app`);
        const pRes = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secret}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: form,
        });
        const payload = (await pRes.json().catch(() => ({}))) as {
          url?: string;
          error?: { message?: string; code?: string };
        };
        if (!pRes.ok || !payload.url) {
          const message = payload.error?.message || "portal unavailable";
          const unconfigured = /configuration/i.test(message);
          return Response.json(
            { error: message, code: unconfigured ? "portal_not_configured" : "portal_failed" },
            { status: unconfigured ? 409 : 502 },
          );
        }
        return Response.json({ url: payload.url });
      },
    },
  },
});
