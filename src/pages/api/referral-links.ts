import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const email = req.query.email;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Missing or invalid email parameter" });
  }

  try {
    const internalUrl = `http://techstories-referral-service.techstories.local:3003/refer_friends?email=${encodeURIComponent(email)}`;
    const response = await fetch(internalUrl, { redirect: "manual" });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location) {
        return res.redirect(location);
      }
    }

    // fallback: return original content if redirect is missing
    const body = await response.text();
    res.status(response.status).send(body);
  } catch (err) {
    console.error("Referral service error:", err);
    res.status(500).json({ error: "Unable to retrieve referral link" });
  }
}