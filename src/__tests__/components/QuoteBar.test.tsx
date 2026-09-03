import { render } from "@testing-library/react";
import { screen, waitFor } from "@testing-library/dom";
import { QuoteBar } from "~/components/QuoteBar";

const fetchMock = jest.fn() as jest.Mock;
global.fetch = fetchMock;

describe("QuoteBar", () => {
  afterEach(() => {
    fetchMock.mockClear();
  });

  test("displays a quote when fetched from API", async () => {
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ quote: "Test quote" }),
      }),
    );

    render(<QuoteBar />);

    await waitFor(() => {
      expect(screen.getByText(/Test quote/)).toBeInTheDocument();
    });
  });

  test("displays an error message when the fetch fails", async () => {
    fetchMock.mockImplementationOnce(() => Promise.reject("API error"));

    render(<QuoteBar />);

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch quote")).toBeInTheDocument();
    });
  });

  test("displays loading state while fetching the data", () => {
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                json: () => Promise.resolve({ quote: "Test quote" }),
              }),
            100,
          );
        }),
    );

    render(<QuoteBar />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
