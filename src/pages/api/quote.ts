export default async function handler(req, res) {
  const QUOTES_API_URL =
    process.env.INTERNAL_QUOTES_API_URL || "http://localhost:3001";

  if (!process.env.INTERNAL_QUOTES_API_URL) {
    console.warn("INTERNAL_QUOTES_API_URL not set — using localhost fallback");
  }

  try {
    const response = await fetch(`${QUOTES_API_URL}/quote`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("Quote API error:", err);
    res.status(500).json({ error: "Failed to fetch quote" });
  }
}