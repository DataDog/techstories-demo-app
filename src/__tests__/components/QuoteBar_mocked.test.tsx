import { render, screen, waitFor } from "@testing-library/react";
import { QuoteBar } from "~/components/QuoteBar";
global.fetch = require("cross-fetch");
jest.spyOn(global, "fetch");

describe("QuoteBar", () => {
  afterEach(() => {
    fetch.mockClear();
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

  // Error handling test
  test("displays an error message when the fetch fails", async () => {
    fetch.mockImplementationOnce(() => Promise.reject("API error"));

    render(<QuoteBar />);

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch quote")).toBeInTheDocument();
    });
  });

  // Loading state test
  test("displays loading state while fetching the data", () => {
    fetch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          // Don't resolve immediately, to test loading state
          setTimeout(
            () =>
              resolve({ json: () => Promise.resolve({ quote: "Test quote" }) }),
            100
          );
        })
    );

    render(<QuoteBar />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
