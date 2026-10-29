import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { formatMoney } from "../data";

const resultHeadings = {
  win: "Chúc mừng! Bạn đã trở thành triệu phú",
  wrong: "Rất tiếc, bạn đã trả lời sai",
  timeout: "Hết giờ!",
  stop: "Bạn đã dừng cuộc chơi",
};

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state;

  if (!result) return <Navigate to="/" replace />;

  return (
    <section className="result-page panel">
      <p className="eyebrow">Kết quả lượt chơi</p>
      <h1>{resultHeadings[result.reason] || "Kết thúc lượt chơi"}</h1>
      <dl className="result-details">
        <div><dt>Người chơi:</dt><dd>{result.name}</dd></div>
        <div><dt>Số câu trả lời đúng:</dt><dd>{result.correctCount}</dd></div>
        <div><dt>Tiền thưởng:</dt><dd>{formatMoney(result.prize)}</dd></div>
      </dl>
      <div className="button-row">
        <button type="button" className="button button--primary" onClick={() => navigate("/play")}>
          Chơi lại
        </button>
        <button type="button" className="button button--secondary" onClick={() => navigate("/")}>
          Về trang chủ
        </button>
      </div>
    </section>
  );
};

export default Result;
