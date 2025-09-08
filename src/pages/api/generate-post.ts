import { authenticatedFetch } from '../../utils/authenticatedFetch';

export default async function handler(req, res) {
  const GENERATE_POSTS_API_URL =
    process.env.INTERNAL_GENERATE_POSTS_API_URL || "http://localhost:3002";

  if (!process.env.INTERNAL_GENERATE_POSTS_API_URL && process.env.NODE_ENV !== "production") {
    console.warn("INTERNAL_GENERATE_POSTS_API_URL not set — using localhost fallback");
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const upstreamUrl = `${GENERATE_POSTS_API_URL}/generate_post`;

    const upstreamResponse = await authenticatedFetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await upstreamResponse.json();
    return res.status(upstreamResponse.status).json(data);
  } catch (err) {
    console.error("Generate Post API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}