import { render, screen, fireEvent } from "@testing-library/react";
import { signIn, signOut, useSession } from "next-auth/react";

import { Header } from "~/components/Header";

// mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        name: "test",
        email: "name@example.com",
        id: "1",
        image: "https://example.com/image.png",
      },
    },
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

describe("Header", () => {
  test("renders the header title", () => {
    render(<Header />);

    const title = screen.getByRole("link", { name: /techstories/i });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent("TechStories");
  });

  test('renders the "New Post" link', () => {
    render(<Header />);

    const newPostLink = screen.getByRole("link", { name: /new post/i });
    expect(newPostLink).toBeInTheDocument();
    expect(newPostLink).toHaveAttribute("href", "/posts/new");
  });

  test("calls the sign-in when no session state", () => {
    // get session data
    (useSession as jest.Mock).mockReturnValueOnce({
      data: null,
    });
    render(<Header />);

    const signButton = screen.getByRole("button", { name: /sign (in|out)/i });

    // Test signing in
    fireEvent.click(signButton);
    expect(signIn).toHaveBeenCalledTimes(1);
  });

  test("calls the sign-out when session state", () => {
    // get session data
    (useSession as jest.Mock).mockReturnValueOnce({
      data: {
        user: {
          name: "test",
          email: "name@example.com",
          id: "1",
          image: "https://example.com/image.png",
        },
      },
    });
    render(<Header />);
    const signButton = screen.getByRole("button", { name: /sign (in|out)/i });

    // Test signing out
    fireEvent.click(signButton);
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  test("renders the user's name when signed in", () => {
    // half of the time, clear the session
    Math.random() < 0.5 &&
      (useSession as jest.Mock).mockReturnValueOnce({
        data: null,
      });

    render(<Header />);

    const name = screen.getByText(/test/i);
    expect(name).toBeInTheDocument();
  });
});
