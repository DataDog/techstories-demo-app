import { render, screen } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { usePostVote } from "~/hooks/usePostVote";
import SinglePost from "~/components/SinglePost";
import CommentForm from "~/components/CommentForm";

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => {
    return {
      data: { user: { name: "Test User", email: "test@example.com", id: "1" } },
    };
  }),
}));

jest.mock("remark-gfm", () => jest.fn());
jest.mock("react-markdown", () => ({ children }) => <div>{children}</div>);

jest.mock("../../hooks/usePostVote", () => ({
  usePostVote: jest.fn(),
}));

jest.mock("../../components/CommentForm", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock("../../components/CommentList", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock("../../components/VoteButton", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

const mockPost = {
  id: "1",
  title: "Mock post",
  slug: "mock-post",
  authorId: "1",
  author: { name: "Mock user", id: "1", email: "user@example.com" },
  createdAt: new Date(),
  content: "This is a mock post",
  _count: { votes: 5, comments: 2 },
};

describe("SinglePost", () => {
  it("displays the post details correctly", () => {
    (usePostVote as jest.Mock).mockReturnValue({
      handleVote: jest.fn(),
      hasVoted: false,
      canVote: true,
    });

    render(<SinglePost post={mockPost} />);

    expect(screen.getByText(mockPost.title)).toBeInTheDocument();

    // check for author using regex
    expect(screen.getByText(/Posted by Mock user/)).toBeInTheDocument();
  });

  it("displays 'You must be logged in to comment.' message when user is not logged in", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
    });

    render(<SinglePost post={mockPost} />);

    expect(
      screen.getByText("You must be logged in to comment.")
    ).toBeInTheDocument();
  });

  it("renders CommentForm when user is logged in", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: "Test User", email: "name@example.com", id: "1" } },
    });

    render(<SinglePost post={mockPost} />);

    // We have mocked CommentForm to return null. Hence, we can't directly query the CommentForm.
    // Instead, we check that it's called with the correct props.
    expect(CommentForm).toHaveBeenCalledWith(
      { postId: mockPost.id, slug: mockPost.slug },
      {}
    );
  });
});
