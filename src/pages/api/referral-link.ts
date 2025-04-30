import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const REFERRAL_SERVICE_BASE_URL =
    process.env.INTERNAL_REFERRAL_SERVICE_BASE_URL || "http://localhost:3003";

  if (!process.env.INTERNAL_REFERRAL_SERVICE_BASE_URL && process.env.NODE_ENV !== "production") {
    console.warn("INTERNAL_REFERRAL_SERVICE_BASE_URL not set — using localhost fallback");
  }

  const email = req.query.email;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Missing or invalid email parameter" });
  }

  try {
    const upstreamUrl = `${REFERRAL_SERVICE_BASE_URL}/refer_friends?email=${encodeURIComponent(email)}`;
    const response = await fetch(upstreamUrl, { redirect: "manual" });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location) {
        return res.redirect(location);
      }
    }

    // Fallback if no redirect header
    const body = await response.text();
    res.status(response.status).send(body);
  } catch (err) {
    console.error("Referral service error:", err);
    res.status(500).json({ error: "Unable to retrieve referral link" });
  }
}