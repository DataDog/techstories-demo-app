import { render, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/router";
import NewPostForm from "~/components/NewPostForm";

// Mocks
jest.mock("next/router", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

const mutateMock = jest.fn();

jest.mock("../../utils/api", () => ({
  api: {
    post: {
      createPost: {
        useMutation: jest.fn(() => ({
          mutate: mutateMock,
        })),
      },
    },
  },
}));

jest.mock("next/dynamic", () => () => {
  const MockedEditor = ({ value, onChange }) => (
    <textarea
      data-testid="md-editor"
      onChange={(e) => onChange(e.target.value)}
      value={value}
    />
  );
  return MockedEditor;
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("NewPostForm", () => {
  it("submits the form with the input values", async () => {
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push });

    const { getByLabelText, getByRole, getByTestId } = render(<NewPostForm />);

    // Simulate user input
    fireEvent.change(getByLabelText("Title"), {
      target: { value: "Test title" },
    });
    fireEvent.change(getByTestId("md-editor"), {
      target: { value: "Test content" },
    });

    // Submit the form
    fireEvent.click(getByRole("button", { name: /submit/i }));

    // Wait for promises to resolve
    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalled();
    });
  });

  it("does not submit the form if the input values are empty", async () => {
    const { getByRole } = render(<NewPostForm />);

    // Submit the form
    fireEvent.click(getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(mutateMock).not.toHaveBeenCalled();
    });
  });
});
