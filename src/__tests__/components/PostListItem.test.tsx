import { render, fireEvent, screen } from "@testing-library/react";
import { PostListItem } from "~/components/PostListItem";
import { usePostVote } from "~/hooks/usePostVote";

jest.mock("../../hooks/usePostVote");

const postMock = {
  id: "1",
  title: "Mock post",
  slug: "mock-post",
  content: "Mock post content",
  authorId: "1",
  author: { name: "Mock user", id: "1", email: "user@example.com" },
  createdAt: new Date(),
  _count: { votes: 5, comments: 3 },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("PostListItem", () => {
  it("renders the post title, author name, vote count, and comment count", () => {
    (usePostVote as jest.Mock).mockReturnValue({
      handleVote: jest.fn(),
      hasVoted: false,
      canVote: true,
    });

    render(<PostListItem post={postMock} />);

    expect(screen.getByText(postMock.title)).toBeInTheDocument();
    expect(
      screen.getByText(postMock._count.votes.toString())
    ).toBeInTheDocument();
    expect(screen.getByText(/by mock user/i)).toBeInTheDocument();
    expect(
      screen.getByText(`${postMock._count.comments} comments`)
    ).toBeInTheDocument();
  });

  it("calls handleVote when vote button is clicked", () => {
    const handleVoteMock = jest.fn();

    (usePostVote as jest.Mock).mockReturnValue({
      handleVote: handleVoteMock,
      hasVoted: false,
      canVote: true,
    });

    render(<PostListItem post={postMock} />);
    fireEvent.click(screen.getByRole("button"));

    expect(handleVoteMock).toHaveBeenCalled();
  });

  it("disables the vote button when user can't vote", () => {
    (usePostVote as jest.Mock).mockReturnValue({
      handleVote: jest.fn(),
      hasVoted: false,
      canVote: false,
    });

    render(<PostListItem post={postMock} />);
    const voteButton = screen.getByRole("button");

    expect(voteButton).toBeDisabled();
  });
});
