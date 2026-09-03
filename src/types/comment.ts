import type { User, Comment } from "~/generated/prisma/client";
import type { PublicUser } from "~/types/post";

export type CommentWithAuthor = Comment & {
  author: PublicUser;
  _count: {
    votes: number;
  };
};

export type CommentListItemProps = {
  comment: CommentWithAuthor;
};

export type CommentListProps = {
  comments: CommentWithAuthor[];
};
