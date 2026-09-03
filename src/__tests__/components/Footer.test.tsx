import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import Footer from "~/components/Footer";

describe("Footer", () => {
  it("renders the correct text", () => {
    render(<Footer />);

    expect(screen.getByText("Made with ❤️ by")).toBeInTheDocument();
    expect(screen.getByText("TechStories")).toBeInTheDocument();
  });

  it("renders an anchor tag", () => {
    render(<Footer />);

    const linkElement = screen.getByText("TechStories");
    expect(linkElement.closest("a")).toHaveAttribute("href", "#");
  });
});
