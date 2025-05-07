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

  // Flaky: sometimes times out waiting for the API (simulates network slowness)
  test("flaky: sometimes times out waiting for quote API", async () => {
    const shouldTimeout = Math.random() > 0.5;
    const fetchQuote = fetch(QUOTES_API_URL).then((res) => res.json());
    if (shouldTimeout) {
      await expect(
        Promise.race([
          fetchQuote,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 100)
          ),
        ])
      ).rejects.toThrow("Timeout");
    } else {
      const data = await fetchQuote;
      expect(data).toHaveProperty("quote");
      expect(typeof data.quote).toBe("string");
      expect(data.quote.length).toBeGreaterThan(0);
    }
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
