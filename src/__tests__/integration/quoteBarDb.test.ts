import fetch from "cross-fetch";

describe("QuoteBar Integration", () => {
  const QUOTES_API_URL = process.env.NEXT_PUBLIC_QUOTES_API_URL
    ? `${process.env.NEXT_PUBLIC_QUOTES_API_URL}/quote`
    : "http://localhost:3001/quote";

  test("fetches a quote from the API", async () => {
    const response = await fetch(QUOTES_API_URL);
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data).toHaveProperty("quote");
    expect(typeof data.quote).toBe("string");
    expect(data.quote.length).toBeGreaterThan(0);
  });

  // Intentionally incorrect test: will always fail
  test("always fails: expects quote to be empty", async () => {
    const response = await fetch(QUOTES_API_URL);
    const data = await response.json();
    expect(data.quote).toBe(""); // This will always fail if the API returns a real quote
    // To fix this test, check for a non-empty quote:
    // expect(data.quote.length).toBeGreaterThan(0);
  });
});
