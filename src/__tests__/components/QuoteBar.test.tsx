import { render, screen, waitFor } from "@testing-library/react";
import { QuoteBar } from "~/components/QuoteBar";
global.fetch = require("cross-fetch");
jest.spyOn(global, "fetch");

describe("QuoteBar", () => {
  afterEach(() => {
    fetch.mockClear();
  });

  test("fetches quote from API", async () => {
    const URL = process.env.NEXT_PUBLIC_QUOTES_API_URL
      ? `${process.env.NEXT_PUBLIC_QUOTES_API_URL}/quote`
      : "http://localhost:3001/quote";

    render(<QuoteBar />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(URL);
    });
  });

  test("displays a quote when fetched from API", async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ quote: "Test quote" }),
      })
    );

    render(<QuoteBar />);

    await waitFor(() => {
      expect(screen.getByText(/Test quote/)).toBeInTheDocument();
    });
  });
});
