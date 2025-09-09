import { render, screen, fireEvent } from "@testing-library/react";
import { VoteButton } from "~/components/VoteButton";

describe("VoteButton", () => {
  test("calls the onClick function when the button is clicked", () => {
    const onClick = jest.fn();
    render(<VoteButton voteType="add" onClick={onClick} />);

    const voteButton = screen.getByRole("button");

    fireEvent.click(voteButton);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("renders the correct aria-label based on the voteType prop", () => {
    render(<VoteButton voteType="add" onClick={jest.fn()} />);
    const addButton = screen.getByRole("button", { name: /add vote/i });
    expect(addButton).toBeInTheDocument();

    render(<VoteButton voteType="remove" onClick={jest.fn()} />);
    const removeButton = screen.getByRole("button", { name: /remove vote/i });
    expect(removeButton).toBeInTheDocument();
  });

  test("applies the disabled styles and attributes when disabled prop is true", () => {
    render(<VoteButton voteType="add" onClick={jest.fn()} disabled />);
    const disabledButton = screen.getByRole("button", { name: /add vote/i });
    expect(disabledButton).toBeDisabled();
    expect(disabledButton).toHaveClass("cursor-not-allowed");
  });

  test("does not apply the disabled styles and attributes when disabled prop is false", () => {
    render(<VoteButton voteType="add" onClick={jest.fn()} disabled={false} />);
    const enabledButton = screen.getByRole("button", { name: /add vote/i });
    expect(enabledButton).not.toBeDisabled();
    expect(enabledButton).not.toHaveClass("cursor-not-allowed");
  });

  test("arrow is pointing up when user hasn't voted yet", () => {
    render(<VoteButton voteType="add" onClick={jest.fn()} />);
    const voteButton = screen.getByRole("button", { name: /add vote/i });
    expect(voteButton).not.toHaveClass("rotate-180");
  });

  test("arrow is pointing down when user has voted", () => {
    render(<VoteButton voteType="remove" onClick={jest.fn()} />);
    const voteButton = screen.getByRole("button", { name: /remove vote/i });
    expect(voteButton).toHaveClass("rotate-180");
  });
});
