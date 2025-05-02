export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const backendUrl = process.env.INTERNAL_REFERRALS_API_URL
      ? `${process.env.INTERNAL_REFERRALS_API_URL}/refer_friends`
      : "http://localhost:3003/refer_friends";

    const backendRes = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const result = await backendRes.json();
    res.status(backendRes.status).json(result);
  } catch (err) {
    console.error("Referral proxy error:", err);
    res.status(500).json({ error: "Referral service unavailable" });
  }
}