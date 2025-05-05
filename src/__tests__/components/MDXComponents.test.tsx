import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MDXComponents } from "~/components/MDXComponents";

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

  test("flaky: sometimes heading is missing children", () => {
    const shouldOmitChildren = Math.random() > 0.5;
    if (shouldOmitChildren) {
      render(MDXComponents.h1({}));
      expect(screen.queryByText("Flaky Heading")).not.toBeInTheDocument();
    } else {
      render(MDXComponents.h1({ children: "Flaky Heading" }));
      expect(screen.getByText("Flaky Heading")).toBeInTheDocument();
    }
  });

  // Intentionally incorrect test: will always fail
  test("always fails: expects a heading that does not exist", () => {
    render(MDXComponents.h1({ children: "Hello World" }));
    expect(screen.getByText("This heading does not exist")).toBeInTheDocument();
  });
});
