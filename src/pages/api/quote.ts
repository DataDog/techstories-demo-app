export default async function handler(req, res) {
    try {
      const response = await fetch("http://techstories-quotes-api.techstories.local:3001/quote");
      const data = await response.json();
      res.status(200).json(data);
    } catch (err) {
      console.error("Quote API error:", err);
      res.status(500).json({ error: "Failed to fetch quote" });
    }
  }