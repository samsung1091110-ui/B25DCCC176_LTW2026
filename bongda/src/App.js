import './App.css';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MAX_GOALS, RESULT_LABELS, ROUNDS, formatDiff } from './data';
import { removeMatch, restoreMatch, setGoals, setMatches } from './features/matchesSlice';
import useFetch from './hooks/useFetch';
import { calcMatchStats, calcStandings, getResult, getTeamName, isValidGoals } from './utils';
import { selectMatches, selectStandings } from './selectors';
import { useNotice } from './context/NoticeContext';
import { useTheme } from './context/ThemeContext';
import AddMatchForm from './components/AddMatchForm';
import GoalPlanner from './components/GoalPlanner';
import StandingsTable from './components/StandingsTable';

const App = () => {
  const matches = useSelector(selectMatches);
  const standings = useSelector(selectStandings);
  const dispatch = useDispatch();
  const { showNotice } = useNotice();
  const { theme, toggleTheme } = useTheme();
  const [roundFilter, setRoundFilter] = useState('all');
  const [deletedMatch, setDeletedMatch] = useState(null);
  const { data, loading, error } = useFetch('/data/matches.json');

  useEffect(() => {
    if (Array.isArray(data)) {
      dispatch(setMatches(data));
    }
  }, [data, dispatch]);

  const visibleMatches = useMemo(
    () => (roundFilter === 'all'
      ? matches
      : matches.filter((match) => match.round === Number(roundFilter))),
    [matches, roundFilter],
  );
  const stats = useMemo(() => calcMatchStats(visibleMatches), [visibleMatches]);
  const visibleStandings = useMemo(() => calcStandings(visibleMatches), [visibleMatches]);
  const leader = visibleMatches.length > 0 ? visibleStandings[0] : null;

  const handleRemove = (match) => {
    setDeletedMatch(match);
    dispatch(removeMatch(match.id));
    showNotice(`Đã xóa trận ${getTeamName(match.home)} - ${getTeamName(match.away)}`);
  };

  const handleUndo = () => {
    if (!deletedMatch) return;
    dispatch(restoreMatch(deletedMatch));
    setDeletedMatch(null);
  };

  const updateMatchGoal = (match, field, goals) => {
    if (!isValidGoals(goals)) return;
    dispatch(setGoals({
      id: match.id,
      homeGoals: field === 'homeGoals' ? goals : match.homeGoals,
      awayGoals: field === 'awayGoals' ? goals : match.awayGoals,
    }));
  };

  const exportStandings = () => {
    const rows = [
      ['Hạng', 'Đội', 'Trận', 'Thắng', 'Hòa', 'Thua', 'BT', 'BB', 'HS', 'Điểm'],
      ...standings.map((team, index) => [
        index + 1,
        team.name,
        team.played,
        team.won,
        team.drawn,
        team.lost,
        team.goalsFor,
        team.goalsAgainst,
        formatDiff(team.diff),
        team.points,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\r\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bang-xep-hang.csv';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <div className={`app ${theme}`} data-build="TH03">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand-mark" aria-hidden="true">BĐ</div>
          <div className="header-copy">
            <p className="eyebrow">LỊCH THI ĐẤU</p>
            <h1>Giải bóng đá khoa</h1>
            <button className="button theme-toggle" type="button" onClick={toggleTheme}>
              Chế độ {theme === 'light' ? 'tối' : 'sáng'}
            </button>
          </div>
          <span className="header-note">Vòng tròn một lượt</span>
        </div>
      </header>

      <main className="page-content">
        <section className="section-card" aria-labelledby="stats-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">TỔNG QUAN</p>
              <h2 id="stats-title">Thống kê</h2>
            </div>
            <label className="round-picker">
              <span>Xem vòng</span>
              <select value={roundFilter} onChange={(event) => setRoundFilter(event.target.value)}>
                <option value="all">Tất cả</option>
                {ROUNDS.map((item) => <option key={item} value={item}>Vòng {item}</option>)}
              </select>
            </label>
          </div>
          <div className="stats-grid">
            <article className="stat-card">
              <span>Số trận: </span>
              <strong>{stats.count}</strong>
            </article>
            <article className="stat-card">
              <span>Tổng số bàn thắng: </span>
              <strong>{stats.goals}</strong>
            </article>
            <article className="stat-card">
              <span>Bàn thắng mỗi trận: </span>
              <strong>{stats.average.toFixed(2)}</strong>
            </article>
            <article className="stat-card leader-stat">
              <span>Đội dẫn đầu: </span>
              <strong>{leader ? `${leader.name} (${leader.points} điểm)` : '—'}</strong>
            </article>
          </div>
        </section>

        <section className="section-card" aria-labelledby="fixtures-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">KẾT QUẢ THI ĐẤU</p>
              <h2 id="fixtures-title">Lịch thi đấu</h2>
            </div>
            {deletedMatch && (
              <button className="button button-secondary" type="button" onClick={handleUndo}>
                Hoàn tác
              </button>
            )}
          </div>

          {loading && <p className="notice">Đang tải lịch thi đấu...</p>}
          {error && <p className="notice notice-error" role="alert">Không tải được lịch thi đấu.</p>}

          {!loading && !error && visibleMatches.length === 0 ? (
            <p className="empty-state">Chưa có trận đấu nào</p>
          ) : !loading && !error ? (
            <div className="table-scroll">
              <table className="matches-table">
                <thead>
                  <tr>
                    <th scope="col">Vòng</th>
                    <th scope="col">Đội nhà</th>
                    <th scope="col">BT nhà</th>
                    <th scope="col">BT khách</th>
                    <th scope="col">Đội khách</th>
                    <th scope="col">Kết quả</th>
                    <th scope="col"><span className="visually-hidden">Thao tác</span></th>
                  </tr>
                </thead>
                <tbody>
                  {visibleMatches.map((match) => {
                    const result = getResult(match);
                    const homeName = getTeamName(match.home);
                    const awayName = getTeamName(match.away);
                    const resultText = RESULT_LABELS[result];

                    return (
                      <tr className={result === 'draw' ? 'draw-row' : ''} key={match.id}>
                        <td><span className="round-badge">{match.round}</span></td>
                        <th scope="row">{homeName}</th>
                        <td>
                          <input
                            className="score-input"
                            type="number"
                            min="0"
                            max={MAX_GOALS}
                            defaultValue={match.homeGoals}
                            aria-label={`Bàn thắng nhà ${homeName} - ${awayName}`}
                            onChange={(event) => {
                              if (isValidGoals(event.target.valueAsNumber)) {
                                updateMatchGoal(match, 'homeGoals', event.target.valueAsNumber);
                              }
                            }}
                          />
                        </td>
                        <td>
                          <input
                            className="score-input"
                            type="number"
                            min="0"
                            max={MAX_GOALS}
                            defaultValue={match.awayGoals}
                            aria-label={`Bàn thắng khách ${homeName} - ${awayName}`}
                            onChange={(event) => {
                              if (isValidGoals(event.target.valueAsNumber)) {
                                updateMatchGoal(match, 'awayGoals', event.target.valueAsNumber);
                              }
                            }}
                          />
                        </td>
                        <td>{awayName}</td>
                        <td><span className={`result-label result-${result}`}>{resultText}</span></td>
                        <td>
                          <button
                            className="icon-button"
                            type="button"
                            aria-label={`Xóa trận ${homeName} - ${awayName}`}
                            onClick={() => handleRemove(match)}
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>

        <section className="section-card" aria-labelledby="standings-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CẬP NHẬT SAU MỖI TRẬN</p>
              <h2 id="standings-title">Bảng xếp hạng</h2>
            </div>
            <button className="button button-secondary" type="button" onClick={exportStandings}>
              Tải CSV
            </button>
          </div>
          <StandingsTable standings={standings} />
        </section>

        <GoalPlanner standings={standings} />
        <AddMatchForm />
      </main>
    </div>
  );
};

export default App;
