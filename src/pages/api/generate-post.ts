export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    try {
      const upstreamResponse = await fetch(
        "http://techstories-generate-posts-api.techstories.local:3002/generate_post",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(req.body),
        }
      );
  
      const data = await upstreamResponse.json();
      return res.status(upstreamResponse.status).json(data);
    } catch (err) {
      console.error("Generate Post API error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }  