import type { Post, User } from "@prisma/client";

export type PostWithAuthor = Post & {
  author: User;
  _count: {
    comments: number;
    votes: number;
  };
};

export type PostListItemProps = {
  post: PostWithAuthor;
};

export type PostListProps = {
  posts: PostWithAuthor[];
};
