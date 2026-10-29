import { useState } from "react";
import { Link } from "react-router-dom";
import { LEVELS } from "../data";

const QuestionBank = ({ questions }) => {
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [query, setQuery] = useState("");

  const handleQueryShift = (event) => setQuery(event.target.value);

  const normalizedQuery = query.trim().toLocaleLowerCase("vi");
  const filteredQuestions = questions.filter((question) => {
    const matchesLevel = selectedLevel === "all" || question.level === Number(selectedLevel);
    const matchesQuery = question.question.toLocaleLowerCase("vi").includes(normalizedQuery);
    return matchesLevel && matchesQuery;
  });

  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">Ôn tập kiến thức</p>
        <h1>Ngân hàng câu hỏi</h1>
      </div>

      <div className="filters panel">
        <label>
          Mức độ
          <select value={selectedLevel} onChange={(event) => setSelectedLevel(event.target.value)}>
            <option value="all">Tất cả</option>
            <option value="1">Dễ</option>
            <option value="2">Trung bình</option>
            <option value="3">Khó</option>
          </select>
        </label>
        <label>
          Tìm kiếm theo nội dung câu hỏi
          <input
            type="search"
            value={query}
            onChange={handleQueryShift}
            placeholder="Nhập từ khóa"
          />
        </label>
      </div>
      <p className="result-count">Có {filteredQuestions.length} câu hỏi</p>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">STT</th>
              <th scope="col">Mức độ</th>
              <th scope="col">Câu hỏi</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.map((question) => (
              <tr key={question.id}>
                <td>{question.id}</td>
                <td>{LEVELS[question.level]}</td>
                <td><Link to={`/questions/${question.id}`}>{question.question}</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredQuestions.length === 0 && <p className="empty-state">Không có câu hỏi phù hợp.</p>}
      </div>
    </section>
  );
};

export default QuestionBank;
