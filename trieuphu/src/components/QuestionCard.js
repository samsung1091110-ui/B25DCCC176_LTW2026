import { LETTERS } from "../data";
import AnswerButton from "./AnswerButton";

const QuestionCard = ({
  question,
  questionNumber,
  selectedIndex,
  status,
  hiddenAnswers,
  onSelect,
}) => (
  <section className="question-card" aria-labelledby="current-question">
    <p className="eyebrow">Câu {questionNumber}/15</p>
    <h2 id="current-question" className="question-card__prompt">{question.question}</h2>
    <div className="answer-grid">
      {question.options.map((option, index) => (
        <AnswerButton
          key={LETTERS[index]}
          index={index}
          option={option}
          selectedIndex={selectedIndex}
          correctIndex={question.answer}
          status={status}
          hidden={hiddenAnswers.includes(index)}
          onSelect={onSelect}
        />
      ))}
    </div>
  </section>
);

export default QuestionCard;
