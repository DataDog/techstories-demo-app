import type { Post, User } from "~/generated/prisma/client";

export type PublicUser = Pick<User, "id" | "name" | "email">;

export type PostWithAuthor = Post & {
  author: PublicUser;
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
