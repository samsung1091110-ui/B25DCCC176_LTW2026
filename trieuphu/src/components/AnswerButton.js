import { LETTERS } from "../data";

const AnswerButton = ({
  index,
  option,
  selectedIndex,
  correctIndex,
  status,
  hidden,
  onSelect,
}) => {
  const selected = selectedIndex === index;
  let answerClass = "answer-button";

  if (hidden) answerClass += " answer-button--hidden";
  if (status === "locked" && selected) {
    answerClass += " answer-button--locking";
  } else if (status === "revealed") {
    if (index === correctIndex) answerClass += " answer-button--correct";
    if (selected && selectedIndex !== correctIndex) {
      answerClass += " answer-button--incorrect";
    }
  }

  return (
    <button
      type="button"
      className={answerClass}
      disabled={status !== "answering" || hidden}
      onClick={() => onSelect(index)}
      aria-pressed={selected}
      aria-label={hidden ? `Đáp án ${LETTERS[index]} đã được ẩn` : `${LETTERS[index]}. ${option}`}
    >
      {!hidden && <span className="answer-button__letter">{LETTERS[index]}.</span>}
      {!hidden && <span>{option}</span>}
      {status === "revealed" && index === correctIndex && (
        <span className="answer-button__note">(Đáp án đúng)</span>
      )}
    </button>
  );
};

export default AnswerButton;
