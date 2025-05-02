export default async function handler(req, res) {
    const { email } = req.query;
  
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Missing or invalid email parameter" });
    }
  
    try {
      const backendRes = await fetch(
        `${process.env.INTERNAL_REFERRALS_API_URL || "http://localhost:3003"}/referrals/history?email=${encodeURIComponent(email)}`
      );
  
      const result = await backendRes.json();
      res.status(backendRes.status).json(result);
    } catch (err) {
      console.error("Referral history proxy error:", err);
      res.status(500).json({ error: "Failed to fetch referral history" });
    }
  }  