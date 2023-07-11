import { useEffect, useState } from "react";

export const QuoteBar = () => {
  const [quote, setQuote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getQuote();
  }, []);

  const getQuote = async () => {
    setLoading(true);
    setError(null);
    try {
      const URL = process.env.NEXT_PUBLIC_QUOTES_API_URL
        ? `${process.env.NEXT_PUBLIC_QUOTES_API_URL}/quote`
        : "http://localhost:3001/quote";
      const response = await fetch(URL);
      const data = await response.json();
      setQuote(data.quote);
    } catch (error) {
      setError("Failed to fetch quote");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-neutral-300">
      <div className="mx-auto max-w-4xl p-2">
        {loading ? "Loading..." : error || quote}
      </div>
    </div>
  );
};

export default QuoteBar;
