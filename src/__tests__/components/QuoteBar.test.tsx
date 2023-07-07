import { render, screen, waitFor } from "@testing-library/react";
import { QuoteBar } from "~/components/QuoteBar";
global.fetch = require("cross-fetch");
jest.spyOn(global, "fetch");

describe("QuoteBar", () => {
  afterEach(() => {
    fetch.mockClear();
  });

  test("fetches quote from API", async () => {
    render(<QuoteBar />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("http://localhost:3001/quote");
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
