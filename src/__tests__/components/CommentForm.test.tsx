import { render, fireEvent, waitFor } from "@testing-library/react";
import { CommentForm } from "~/components/CommentForm";

jest.mock("../../utils/api", () => ({
  api: {
    useContext: jest.fn(() => ({
      post: {
        getPostBySlug: {
          invalidate: jest.fn(),
        },
      },
    })),
    comment: {
      createComment: {
        useMutation: jest.fn(() => ({
          mutate: jest.fn(),
          isLoading: false,
        })),
      },
    },
  },
}));

jest.mock("next/dynamic", () => () => {
  const MockComponent = () => <div />;
  return MockComponent;
});

it("should render a form with a Markdown component and a submit button", async () => {
  const { getByRole } = render(<CommentForm postId="1" slug="test" />);

  // We'll use waitFor to help with the async nature of dynamic import
  await waitFor(() => {
    expect(getByRole("form")).toBeInTheDocument();
    expect(getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });
});

it("should submit the form when the submit button is clicked", async () => {
  const { getByRole } = render(<CommentForm postId="1" slug="test" />);

  await waitFor(() => {
    fireEvent.click(getByRole("button", { name: /submit/i }));
  });
});
