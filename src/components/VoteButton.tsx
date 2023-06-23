type IVoteButtonProps = {
  voteType: "add" | "remove";
  disabled?: boolean;
  onClick: () => void;
};

const UpArrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="h-6 w-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 15.75l7.5-7.5 7.5 7.5"
    />
  </svg>
);

export const VoteButton: React.FC<IVoteButtonProps> = ({
  voteType,
  disabled,
  onClick,
}) => {
  return (
    // if disabled then add a class to the button to make it look disabled
    <button
      aria-label={voteType === "add" ? "Add Vote" : "Remove Vote"}
      role="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-1 text-neutral-500 transition-all hover:text-neutral-700 ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      } ${voteType === "remove" ? "rotate-180 transform" : ""}`}
    >
      <UpArrow />
    </button>
  );
};

export default VoteButton;
