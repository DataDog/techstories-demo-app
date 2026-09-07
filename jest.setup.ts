import "@testing-library/jest-dom";

jest.mock("~/utils/api", () => ({
  api: {
    useUtils: jest.fn(() => ({
      post: {
        getPosts: { invalidate: jest.fn() },
        getPostBySlug: { invalidate: jest.fn() },
        hasVoted: { invalidate: jest.fn() },
      },
      comment: {
        getCommentsByPostId: { invalidate: jest.fn() },
        hasVoted: { invalidate: jest.fn() },
      },
    })),
    post: {
      hasVoted: { useQuery: jest.fn(() => ({ data: 0 })) },
      addVote: { useMutation: jest.fn(() => ({ mutate: jest.fn() })) },
      removeVote: { useMutation: jest.fn(() => ({ mutate: jest.fn() })) },
    },
    comment: {
      hasVoted: { useQuery: jest.fn(() => ({ data: 0 })) },
      addVote: { useMutation: jest.fn(() => ({ mutate: jest.fn() })) },
      removeVote: { useMutation: jest.fn(() => ({ mutate: jest.fn() })) },
      getCommentsByPostId: { useQuery: jest.fn(() => ({ data: [] })) },
      createComment: {
        useMutation: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
      },
    },
  },
}));
