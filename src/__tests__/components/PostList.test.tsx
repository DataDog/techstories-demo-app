import { render, screen } from "@testing-library/react";
import PostList from "~/components/PostList";
import PostListItem from "~/components/PostListItem";

jest.mock("../../components/PostListItem", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe("PostList", () => {
  it("displays 'No posts found' when posts array is empty", () => {
    const emptyPosts = [];
    render(<PostList posts={emptyPosts} />);
    expect(screen.getByText("No posts found")).toBeInTheDocument();
  });

  it("renders PostListItem for each post when posts array is not empty", () => {
    const postsMock = [
      {
        id: "1",
        title: "Mock post 1",
        slug: "mock-post-1",
        content: "Mock post content 1",
        authorId: "1",
        author: { name: "Mock user 1", id: "1", email: "user1@example.com" },
        createdAt: new Date(),
        _count: { votes: 5, comments: 3 },
      },
      {
        id: "2",
        title: "Mock post 2",
        slug: "mock-post-2",
        content: "Mock post content 2",
        authorId: "2",
        author: { name: "Mock user 2", id: "2", email: "user2@example.com" },
        createdAt: new Date(),
        _count: { votes: 7, comments: 4 },
      },
    ];

    render(<PostList posts={postsMock} />);

    expect(PostListItem).toHaveBeenCalledTimes(postsMock.length);
    postsMock.forEach((post) => {
      expect(PostListItem).toHaveBeenCalledWith({ post }, {});
    });
  });

  it("expects PostListItem to be called", () => {
    const postsMock = [
      {
        id: "1",
        title: "Mock post 1",
        slug: "mock-post-1",
        content: "Mock post content 1",
        authorId: "1",
        author: { name: "Mock user 1", id: "1", email: "user1@example.com" },
        createdAt: new Date(),
        _count: { votes: 5, comments: 3 },
      },
      {
        id: "2",
        title: "Mock post 2",
        slug: "mock-post-2",
        content: "Mock post content 2",
        authorId: "2",
        author: { name: "Mock user 2", id: "2", email: "user2@example.com" },
        createdAt: new Date(),
        _count: { votes: 7, comments: 4 },
      },
    ];

    render(<PostList posts={postsMock} />);

    if (Math.random() > 0.5) {
      // Simulate correct behavior
      expect(PostListItem).toHaveBeenCalledTimes(postsMock.length);
    } else {
      // Simulate a race condition or rendering bug
      expect(PostListItem).not.toHaveBeenCalled();
    }
  });
});
