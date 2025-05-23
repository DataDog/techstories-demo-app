import fetch from "cross-fetch";

const QUOTES_API_URL = "http://localhost:3001/quote";

interface QuoteResponse {
  quote: string;
}

interface RequestResult {
  status: number;
  ok: boolean;
  body: Promise<QuoteResponse> | null;
}

describe("Quotes API Integration", () => {
  const DEFAULT_TIMEOUT = 5000;
  let originalTimeout: number;

  beforeAll(() => {
    originalTimeout = DEFAULT_TIMEOUT;
    jest.setTimeout(DEFAULT_TIMEOUT);
  });

  afterAll(() => {
    jest.setTimeout(originalTimeout);
  });

  // Helper to make multiple requests with timeout
  const makeMultipleRequests = async (
    count: number
  ): Promise<RequestResult[]> => {
    const requests = Array.from({ length: count }, async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const res = await fetch(QUOTES_API_URL, {
          signal: controller.signal,
        });

        clearTimeout(timeout);

        return {
          status: res.status,
          ok: res.ok,
          body: res.ok ? (res.json() as Promise<QuoteResponse>) : null,
        };
      } catch (error) {
        // Return a failed result on timeout or other errors
        return {
          status: 500,
          ok: false,
          body: null,
        };
      }
    });

    return Promise.all(requests);
  };

  it("should handle a request successfully", async () => {
    const results = await makeMultipleRequests(1);
    expect(results[0].ok).toBe(true);
  });

  it("should handle occasional 500 errors gracefully", async () => {
    jest.setTimeout(1000); // Reduced timeout since we're making fewer requests
    // create flakiness by randomizing the number of requests between 100 and 200
    const numRequests = Math.floor(Math.random() * 100);
    const results = await makeMultipleRequests(numRequests);

    // Count successes and failures
    const successes = results.filter((r) => r.ok);
    const failures = results.filter((r) => r.status === 500);

    expect(failures.length).toBeLessThanOrEqual(15);
    expect(failures.length / results.length).toBeLessThan(0.15);

    // Successful responses should have quotes
    for (const success of successes) {
      const data = await success.body;
      expect(data).not.toBeNull();
      if (data) {
        expect(data).toHaveProperty("quote");
        expect(typeof data.quote).toBe("string");
      }
    }
  });

  it("should return different quotes over multiple requests", async () => {
    // Make 20 requests
    const results = await makeMultipleRequests(20);
    const quotes = new Set<string>();

    // Collect unique quotes
    for (const result of results) {
      if (result.ok && result.body) {
        const data = await result.body;
        if (data) {
          quotes.add(data.quote);
        }
      }
    }

    // We should get some variety in our quotes
    // This might fail if we get really unlucky with the random selection
    expect(quotes.size).toBeGreaterThan(5);
  });

  it("should handle rapid concurrent requests", async () => {
    // Make many concurrent requests
    const start = Date.now();
    const results = await Promise.all([
      makeMultipleRequests(20),
      makeMultipleRequests(20),
      makeMultipleRequests(20),
    ]);
    const end = Date.now();

    const flatResults = results.flat();

    // Some requests might fail under load
    const failures = flatResults.filter((r) => !r.ok);

    // We expect some failures but not total failure
    expect(failures.length).toBeLessThan(flatResults.length);

    // Response times might be elevated under load
    const totalTime = end - start;
    expect(totalTime).toBeGreaterThan(100);
  });
});
