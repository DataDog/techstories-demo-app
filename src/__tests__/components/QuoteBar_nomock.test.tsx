import { render, cleanup, waitFor } from "@testing-library/react";
import { QuoteBar } from "~/components/QuoteBar";
global.fetch = require("cross-fetch");
jest.spyOn(global, "fetch");

describe("QuoteBar", () => {
  afterEach(() => {
    fetch.mockClear();
    cleanup();
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

  test("fetches quote from API", async () => {
    const response = await fetch("http://localhost:3001/quote");
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(json).toHaveProperty("quote");
  });
});
