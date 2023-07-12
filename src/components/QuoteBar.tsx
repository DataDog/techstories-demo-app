import { useEffect, useState } from "react";

export const QuoteBar = () => {
  const [quote, setQuote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      <div className="mx-auto flex max-w-4xl items-center justify-between px-2 py-4">
        <div className="italic">{loading ? "Loading..." : error || quote}</div>
        <button
          onClick={() => void getQuote()}
          className="rounded-md bg-neutral-100 px-2 py-1 text-sm hover:bg-neutral-500 hover:text-neutral-100"
        >
          Get a new quote
        </button>
      </div>
    </div>
  );
};

export default QuoteBar;
