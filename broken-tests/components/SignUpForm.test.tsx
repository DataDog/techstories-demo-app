import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SignUp } from "../../pages/auth/signup";
import { api } from "../../utils/api";
import { signIn, SessionProvider } from "next-auth/react";
import { useRouter } from "next/router";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../server/api/root";

// Create a new tRPC instance
export const trpc = createTRPCReact<AppRouter>();

// Mock next/router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// Mock next/head
jest.mock("next/head", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock layout components
jest.mock("../../components/Header", () => ({
  Header: () => <div data-testid="mock-header">Header</div>,
}));

jest.mock("../../components/Footer", () => ({
  Footer: () => <div data-testid="mock-footer">Footer</div>,
}));

jest.mock("../../components/QuoteBar", () => ({
  QuoteBar: () => <div data-testid="mock-quote-bar">Quote Bar</div>,
}));

// Mock next-auth/react
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
  useSession: jest.fn(() => ({
    data: null,
    status: "unauthenticated",
  })),
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock the API
jest.mock("../../utils/api", () => ({
  api: {
    user: {
      register: {
        useMutation: jest.fn(() => ({
          mutateAsync: jest.fn(),
          isLoading: false,
        })),
      },
    },
  },
}));

// Mock tRPC
jest.mock("@trpc/react-query", () => ({
  createTRPCReact: jest.fn(() => ({
    useContext: jest.fn(() => ({
      user: {
        register: {
          useMutation: jest.fn(() => ({
            mutateAsync: jest.fn(),
            isLoading: false,
          })),
        },
      },
    })),
  })),
}));

// Counter for predictable flaky behavior
let testCounter = 0;

describe("SignUp Integration Test", () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  const renderSignUp = () => {
    return render(
      <SessionProvider>
        <SignUp />
      </SessionProvider>
    );
  };

  it("should render the signup form", () => {
    renderSignUp();

    expect(screen.getByRole("form")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  it("should show error when passwords don't match", async () => {
    renderSignUp();

    const emailInput = screen.getByLabelText(/email/i);
    const nameInput = screen.getByLabelText(/name/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password456" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("should successfully register and redirect to home", async () => {
    const mockRegisterMutation = jest.fn();
    (api.user.register.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockRegisterMutation,
      isLoading: false,
    });

    (signIn as jest.Mock).mockResolvedValue({ error: null });

    renderSignUp();

    const emailInput = screen.getByLabelText(/email/i);
    const nameInput = screen.getByLabelText(/name/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegisterMutation).toHaveBeenCalledWith({
        email: "test@example.com",
        name: "Test User",
        password: "password123",
      });
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "test@example.com",
        password: "password123",
        redirect: false,
      });
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("should show error when registration fails", async () => {
    const mockError = new Error("Email already exists");
    const mockRegisterMutation = jest.fn().mockRejectedValue(mockError);
    (api.user.register.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockRegisterMutation,
      isLoading: false,
    });

    renderSignUp();

    const emailInput = screen.getByLabelText(/email/i);
    const nameInput = screen.getByLabelText(/name/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });

  it("should show error when sign in after registration fails", async () => {
    const mockRegisterMutation = jest.fn().mockResolvedValue({});
    (api.user.register.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockRegisterMutation,
      isLoading: false,
    });

    (signIn as jest.Mock).mockResolvedValue({ error: "Failed to sign in" });

    renderSignUp();

    const emailInput = screen.getByLabelText(/email/i);
    const nameInput = screen.getByLabelText(/name/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/failed to sign in after registration/i)
      ).toBeInTheDocument();
    });
  });

  it("should show loading state while submitting", async () => {
    const mockRegisterMutation = jest
      .fn()
      .mockImplementation(() => new Promise(() => {})); // Never resolves
    (api.user.register.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockRegisterMutation,
      isLoading: true,
    });

    renderSignUp();

    const emailInput = screen.getByLabelText(/email/i);
    const nameInput = screen.getByLabelText(/name/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /creating account/i })
      ).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  it("should have a link to the sign in page", () => {
    renderSignUp();

    const signInLink = screen.getByRole("link", { name: /sign in/i });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute("href", "/auth/signin");
  });

  it("should validate required fields", async () => {
    renderSignUp();

    const submitButton = screen.getByRole("button", { name: /sign up/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // HTML5 validation messages will be shown
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(
        /^password$/i
      ) as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText(
        /confirm password/i
      ) as HTMLInputElement;

      expect(emailInput.validity.valid).toBe(false);
      expect(nameInput.validity.valid).toBe(false);
      expect(passwordInput.validity.valid).toBe(false);
      expect(confirmPasswordInput.validity.valid).toBe(false);
    });
  });

  it("should validate email format", async () => {
    renderSignUp();

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(emailInput.validity.valid).toBe(false);
      expect(emailInput.validity.typeMismatch).toBe(true);
    });

    fireEvent.change(emailInput, { target: { value: "valid@email.com" } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(emailInput.validity.valid).toBe(true);
    });
  });

  it("should handle registration (flaky network test)", async () => {
    const mockRegisterMutation = jest.fn().mockImplementation(() => {
      return new Promise((resolve, reject) => {
        // 80% chance of failure with different error types
        if (Math.random() < 0.8) {
          const errors = [
            "Network timeout",
            "Server error: 500",
            "Connection reset",
            "Too many requests",
          ];
          const errorMessage =
            errors[Math.floor(Math.random() * errors.length)];
          reject(new Error(errorMessage));
        } else {
          // Even on "success" path, sometimes delay long enough to timeout
          const delay = Math.random() < 0.5 ? 150 : 10;
          setTimeout(() => resolve({}), delay);
        }
      });
    });

    (api.user.register.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockRegisterMutation,
      isLoading: false,
    });

    (signIn as jest.Mock).mockResolvedValue({ error: null });

    renderSignUp();

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    // Very short timeout to catch either result
    await waitFor(
      () => {
        const errorElement = screen.queryByText(
          /network|error|connection|requests/i
        );
        const successRedirect = mockPush.mock.calls.some(
          (call) => call[0] === "/"
        );

        // One of these must be true
        expect(errorElement !== null || successRedirect).toBe(true);
      },
      { timeout: 100, interval: 10 } // Aggressive timing
    );
  });
});
