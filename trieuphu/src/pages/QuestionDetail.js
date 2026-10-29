import { useNavigate, useParams } from "react-router-dom";
import { LEVELS, LETTERS } from "../data";

const QuestionDetail = ({ questions }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const questionId = Number(id);
  const question = questions.find((item) => item.id === questionId);

  if (!question) {
    return (
      <section className="panel">
        <h1>Không tìm thấy câu hỏi</h1>
        <button type="button" className="button button--secondary" onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </section>
    );
  }

  return (
    <section className="detail-page">
      <p className="eyebrow">Ngân hàng câu hỏi</p>
      <h1>Câu hỏi số {question.id} ({LEVELS[question.level]})</h1>
      <div className="panel detail-question">
        <h2>{question.question}</h2>
        <ol className="detail-options">
          {question.options.map((option, index) => (
            <li
              key={LETTERS[index]}
              className={index === question.answer ? "detail-option detail-option--correct" : "detail-option"}
            >
              <span>{LETTERS[index]}.</span> {option}
              {index === question.answer && <strong> (Đáp án đúng)</strong>}
            </li>
          ))}
        </ol>
      </div>
      <button type="button" className="button button--secondary" onClick={() => navigate(-1)}>
        Quay lại
      </button>
    </section>
  );
};

export default QuestionDetail;
