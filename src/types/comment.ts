import type { User, Comment } from "@prisma/client";

export type CommentWithAuthor = Comment & {
  author: User;
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
