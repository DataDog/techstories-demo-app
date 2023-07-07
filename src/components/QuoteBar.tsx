import { useEffect, useState } from "react";

export const QuoteBar = () => {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    getQuote();
  }, []);

  const getQuote = async () => {
    try {
      const url =
        process.env.NEXT_PUBLIC_QUOTES_API_URL || "http://localhost:3001/quote";
      const response = await fetch(url);
      const data = await response.json();
      setQuote(data.quote);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full bg-neutral-300">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-2 py-4">
        <div className="italic">{quote}</div>
        <button
          onClick={getQuote}
          className="rounded-md bg-neutral-100 px-2 py-1 text-sm hover:bg-neutral-500 hover:text-neutral-100"
        >
          Get a new quote
        </button>
      </div>
    </div>
  );
};
