import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// Checkout session, subscription or subscription item — whichever the client kept.
const REF = /^(?:cs_(?:test|live)|sub|si)_[A-Za-z0-9]{6,200}$/;

function trustedOrigin(req) {
  if (process.env.APP_ORIGIN) return process.env.APP_ORIGIN;
  const origin = req.headers.origin || "";
  if (/^https:\/\//i.test(origin)) return origin;
  return "https://epilumina.vercel.app";
}

const customerOf = (obj) =>
  typeof obj?.customer === "string" ? obj.customer : (obj?.customer?.id ?? "");

/** Dowolny identyfikator zakupu → id klienta Stripe. */
async function resolveCustomer(ref) {
  if (ref.startsWith("cs_")) {
    const s = await stripe.checkout.sessions.retrieve(ref);
    const customer = customerOf(s);
    if (s.status !== "complete" || !customer) return null;
    return customer;
  }
  if (ref.startsWith("si_")) {
    const item = await stripe.subscriptionItems.retrieve(ref);
    const subId =
      typeof item.subscription === "string" ? item.subscription : (item.subscription?.id ?? "");
    if (!subId) return null;
    const sub = await stripe.subscriptions.retrieve(subId);
    return customerOf(sub) || null;
  }
  const sub = await stripe.subscriptions.retrieve(ref);
  return customerOf(sub) || null;
}

// Stripe Billing Portal — customer derived from the verified purchase (no DB).
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const raw = req.body && (req.body.sessionId ?? req.body.ref);
  const ref = typeof raw === "string" ? raw.trim() : "";
  if (!REF.test(ref)) return res.status(400).json({ error: "invalid id", code: "invalid_id" });

  try {
    const customer = await resolveCustomer(ref);
    if (!customer) {
      return res.status(404).json({ error: "no subscription", code: "no_subscription" });
    }
    const portal = await stripe.billingPortal.sessions.create({
      customer,
      return_url: `${trustedOrigin(req)}/app`,
    });
    return res.status(200).json({ url: portal.url });
  } catch (error) {
    const message = (error && error.message) || "portal unavailable";
    if (error && error.code === "resource_missing") {
      return res.status(404).json({ error: "not found", code: "no_subscription" });
    }
    const unconfigured = /configuration/i.test(message);
    return res
      .status(unconfigured ? 409 : 502)
      .json({ error: message, code: unconfigured ? "portal_not_configured" : "portal_failed" });
  }
}
