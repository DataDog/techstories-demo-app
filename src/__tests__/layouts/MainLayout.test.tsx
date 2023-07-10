import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import MainLayout from "~/layouts/MainLayout";
import { useSession } from "next-auth/react";

// Mock the signIn and signOut functions from next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        name: "test",
        email: "name@example.com",
        id: "1",
      },
    },
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

describe("MainLayout", () => {
  it("renders child content correctly", () => {
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
    render(
      <MainLayout pageTitle="Test Page" description="Test Description">
        <div>Test Child</div>
      </MainLayout>
    );

    expect(screen.queryAllByText("TechStories")).toHaveLength(2);
    expect(screen.getByText("Hi, test!")).toBeInTheDocument();
    expect(screen.getByText("+ New Post")).toBeInTheDocument();
    expect(screen.getByText("Sign out")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("renders sign in when no session data", () => {
    jest.resetModules();

    (useSession as jest.Mock).mockReturnValueOnce({
      data: null,
    });

    render(
      <MainLayout pageTitle="Test Page" description="Test Description">
        <div>Test Child</div>
      </MainLayout>
    );

    expect(screen.queryAllByText("TechStories")).toHaveLength(2);
    expect(screen.getByText("+ New Post")).toBeInTheDocument();
    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });
});
