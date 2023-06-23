import { render, fireEvent, waitFor } from "@testing-library/react";
import { signIn } from "next-auth/react";
import SignInForm from "~/components/SignInForm";

const mockPush = jest.fn();

jest.mock("next-auth/react");
jest.mock("next/router", () => ({
  useRouter: jest.fn(() => ({ query: { callbackUrl: "/" }, push: mockPush })),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SignInForm", () => {
  it("displays an error message when the user inputs incorrect credentials", async () => {
    // Mock the signIn function to return an error
    (signIn as jest.Mock).mockResolvedValue({ error: "Invalid credentials" });

    const { getByLabelText, getByRole, findByText } = render(<SignInForm />);

    // Simulate user input
    fireEvent.change(getByLabelText("Email"), {
      target: { value: "wrongemail@example.com" },
    });
    fireEvent.change(getByLabelText("Password"), {
      target: { value: "wrongpassword" },
    });

    // Submit the form
    fireEvent.click(getByRole("button", { name: /sign in/i }));

    // Expect an error message to be displayed
    await findByText("Your email or password is incorrect.");
  });

  it("redirects the user after a successful sign-in", async () => {
    // Mock the signIn function to return a success
    (signIn as jest.Mock).mockResolvedValue({ error: null });

    const { getByLabelText, getByRole } = render(<SignInForm />);

    // Simulate user input
    fireEvent.change(getByLabelText("Email"), {
      target: { value: "alice.smith@example.com" },
    });
    fireEvent.change(getByLabelText("Password"), {
      target: { value: "password" },
    });

    // Submit the form
    fireEvent.click(getByRole("button", { name: /sign in/i }));

    // Wait for promises to resolve
    await waitFor(() => {
      // Expect push to have been called with "/"
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
});
