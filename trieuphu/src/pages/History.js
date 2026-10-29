import { formatMoney } from "../data";

const History = ({ history, onClearHistory }) => {
  const totalPrize = history.reduce((total, game) => total + game.prize, 0);
  const highestPrize = history.reduce(
    (highest, game) => Math.max(highest, game.prize),
    0
  );
  const sortedHistory = [...history].sort((first, second) => second.prize - first.prize);

  return (
    <section>
      <div className="page-heading page-heading--row">
        <div>
          <p className="eyebrow">Các lượt đã chơi</p>
          <h1>Lịch sử</h1>
        </div>
        <button
          type="button"
          className="button button--quiet"
          onClick={onClearHistory}
          disabled={history.length === 0}
        >
          Xóa lịch sử
        </button>
      </div>

      <div className="history-stats panel">
        <p>Số lượt chơi: <strong>{history.length}</strong></p>
        <p>Tiền thưởng cao nhất: <strong>{formatMoney(highestPrize)}</strong></p>
        <p>Tổng tiền thưởng: <strong>{formatMoney(totalPrize)}</strong></p>
      </div>

      {history.length === 0 ? (
        <p className="empty-state panel">Chưa có lượt chơi nào.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Người chơi</th>
                <th scope="col">Số câu đúng</th>
                <th scope="col">Tiền thưởng</th>
                <th scope="col">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {sortedHistory.map((game) => (
                <tr key={game.id}>
                  <td>{game.name}</td>
                  <td>{game.correctCount}</td>
                  <td>{formatMoney(game.prize)}</td>
                  <td>{game.playedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default History;
