import { useNavigate } from "react-router-dom";

const Home = ({ playerName, setPlayerName }) => {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (playerName.trim()) navigate("/play");
  };

  return (
    <section className="home-page">
      <div className="home-page__intro">
        <p className="eyebrow">Trò chơi kiến thức</p>
        <h1>Ai là triệu phú</h1>
        <p className="lead">
          Trả lời 15 câu hỏi về HTML, CSS, ES6 và React để chinh phục giải thưởng
          cao nhất.
        </p>
      </div>
      <div className="home-grid">
        <section className="panel rules-panel">
          <h2>Luật chơi</h2>
          <ul className="rules-list">
            <li>Mỗi câu có 30 giây để trả lời.</li>
            <li>Trả lời đúng để đi tiếp và tăng tiền thưởng.</li>
            <li>Câu 5, 10 và 15 là các mốc an toàn.</li>
          </ul>
        </section>
        <section className="panel start-panel">
          <h2>Sẵn sàng chưa?</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="player-name">Tên người chơi</label>
            <input
              id="player-name"
              type="text"
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              autoComplete="name"
              maxLength={40}
              placeholder="Nhập tên của bạn"
            />
            <button className="button button--primary" type="submit" disabled={!playerName.trim()}>
              Bắt đầu
            </button>
          </form>
        </section>
      </div>
    </section>
  );
};

export default Home;
