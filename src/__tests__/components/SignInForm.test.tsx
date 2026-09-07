import { render } from "@testing-library/react";
import { fireEvent, waitFor } from "@testing-library/dom";
import SignInForm from "~/components/SignInForm";

const mockPush = jest.fn();
const mockSignIn = jest.fn();

jest.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
  signOut: jest.fn(),
  useSession: jest.fn(() => ({ data: null })),
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));
jest.mock("next/router", () => ({
  useRouter: jest.fn(() => ({ query: { callbackUrl: "/" }, push: mockPush })),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SignInForm", () => {
  it("displays an error message when the user inputs incorrect credentials", async () => {
    mockSignIn.mockResolvedValue({ error: "Invalid credentials" });

    const { getByLabelText, getByRole, findByText } = render(<SignInForm />);

    fireEvent.change(getByLabelText("Email"), {
      target: { value: "wrongemail@example.com" },
    });
    fireEvent.change(getByLabelText("Password"), {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(getByRole("button", { name: /sign in/i }));

    await findByText("Your email or password is incorrect.");
  });

  it("redirects the user after a successful sign-in", async () => {
    mockSignIn.mockResolvedValue({ error: null });

    const { getByLabelText, getByRole } = render(<SignInForm />);

    fireEvent.change(getByLabelText("Email"), {
      target: { value: "alice.smith@example.com" },
    });
    fireEvent.change(getByLabelText("Password"), {
      target: { value: "password" },
    });

    fireEvent.click(getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
});
