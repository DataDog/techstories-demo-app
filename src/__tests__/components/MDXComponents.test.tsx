import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MDXComponents } from "~/components/MDXComponents";
import { useState, useEffect } from "react";

describe("MDXComponents", () => {
  test("renders a heading", () => {
    render(MDXComponents.h1({ children: "Hello World" }));
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  test("renders a link", () => {
    render(
      MDXComponents.a({ children: "Click me", href: "https://example.com" })
    );
    const link = screen.getByText("Click me");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  test("waits for update", async () => {
    const AsyncHeading = () => {
      const [content, setContent] = useState("Loading...");

      useEffect(() => {
        setTimeout(() => {
          setContent("Loaded Content");
        }, 100);
      }, []);

      return <MDXComponents.h1>{content}</MDXComponents.h1>;
    };

    render(<AsyncHeading />);
    await screen.findByText("Loaded Content");
  });
});
