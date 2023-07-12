import { render, fireEvent, waitFor } from "@testing-library/react";
import { CommentListItem } from "~/components/CommentListItem";
import { useCommentVote } from "~/hooks/useCommentVote";

// Mock the next-auth hook
jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { name: "Test User", email: "name@example.com", id: "1" } },
  }),
}));

// Mock the custom hooks
jest.mock("../../hooks/useCommentVote");

jest.mock("remark-gfm", () => jest.fn());
jest.mock("react-markdown", () => ({ children }) => <div>{children}</div>);

afterEach(() => {
  jest.clearAllMocks();
});

const commentMock = {
  id: "1",
  content: "Mock comment",
  postId: "1",
  authorId: "1",
  author: { name: "Mock user", email: "name@example.com", id: "1" },
  createdAt: new Date(),
  _count: { votes: 5 },
};

describe("CommentListItem", () => {
  it("renders the comment content, author name, and vote count", () => {
    (useCommentVote as jest.Mock).mockReturnValue({
      handleVote: jest.fn(),
      hasVoted: false,
      canVote: true,
    });

    const { getByText } = render(<CommentListItem comment={commentMock} />);

    expect(getByText(commentMock.content)).toBeInTheDocument();
    expect(getByText(commentMock._count.votes.toString())).toBeInTheDocument();
    expect(getByText(/by mock user/i)).toBeInTheDocument();
  });

  it("vote button is disabled if user is not logged in", () => {
    (useCommentVote as jest.Mock).mockReturnValue({
      handleVote: jest.fn(),
      hasVoted: false,
      canVote: false,
    });

    const { getByRole } = render(<CommentListItem comment={commentMock} />);
    // expect button to be disabled
    expect(getByRole("button")).toBeDisabled();
  });

  it("calls removeVote mutation when user clicks vote button and has already voted", async () => {
    const handleVoteMock = jest.fn();

    // Mock the return values of the custom hooks
    (useCommentVote as jest.Mock).mockReturnValue({
      handleVote: handleVoteMock,
      hasVoted: true,
      canVote: true,
    });

    const { getByRole } = render(<CommentListItem comment={commentMock} />);

    await waitFor(() => fireEvent.click(getByRole("button")));

    // check if handleVote function is called when the button is clicked
    expect(handleVoteMock).toHaveBeenCalled();
  });
});
