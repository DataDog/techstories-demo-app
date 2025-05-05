import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { QuoteBar } from "~/components/QuoteBar";

beforeEach(() => {
  global.fetch = jest.fn();
});
afterEach(() => {
  jest.resetAllMocks();
});

describe("QuoteBar", () => {
  test("shows loading state initially", () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<QuoteBar />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("shows error state if fetch fails", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("fail"));
    render(<QuoteBar />);
    await waitFor(() =>
      expect(screen.getByText(/failed to fetch quote/i)).toBeInTheDocument()
    );
  });

  test("shows quote if fetch succeeds", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => ({ quote: "Test quote!" }),
    });
    render(<QuoteBar />);
    await waitFor(() =>
      expect(screen.getByText(/test quote!/i)).toBeInTheDocument()
    );
  });

  test("flaky: sometimes expects error, sometimes success", async () => {
    if (Math.random() > 0.5) {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("fail"));
      render(<QuoteBar />);
      await waitFor(() =>
        expect(screen.getByText(/failed to fetch quote/i)).toBeInTheDocument()
      );
    } else {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => ({ quote: "Flaky quote!" }),
      });
      render(<QuoteBar />);
      await waitFor(() =>
        expect(screen.getByText(/flaky quote!/i)).toBeInTheDocument()
      );
    }
  });
});
