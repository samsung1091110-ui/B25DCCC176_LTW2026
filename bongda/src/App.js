import './App.css';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { MAX_GOALS, RESULT_LABELS, ROUNDS, TEAMS, formatDiff } from './data';
import matchesReducer from './matchesReducer';
import useFetch from './hooks/useFetch';
import { calcMatchStats, calcStandings, getResult, getTeamName, isValidGoals } from './utils';
import { selectStandings } from './selectors';
import StandingsTable from './components/StandingsTable';

const App = () => {
  const [matches, dispatch] = useReducer(matchesReducer, []);
  const [roundFilter, setRoundFilter] = useState('all');
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [round, setRound] = useState('1');
  const [homeGoals, setHomeGoals] = useState('');
  const [awayGoals, setAwayGoals] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [deletedMatch, setDeletedMatch] = useState(null);
  const homeSelectRef = useRef(null);
  const { data, loading, error } = useFetch('/data/matches.json');

  useEffect(() => {
    if (Array.isArray(data)) {
      dispatch({ type: 'LOAD', payload: data });
    }
  }, [data]);

  const visibleMatches = useMemo(
    () => (roundFilter === 'all'
      ? matches
      : matches.filter((match) => match.round === Number(roundFilter))),
    [matches, roundFilter],
  );
  const stats = useMemo(() => calcMatchStats(visibleMatches), [visibleMatches]);
  const visibleStandings = useMemo(() => calcStandings(visibleMatches), [visibleMatches]);
  const standings = selectStandings({ matches });
  const leader = visibleMatches.length > 0 ? visibleStandings[0] : null;

  const handleAddMatch = (event) => {
    event.preventDefault();

    if (!homeTeam) {
      setFormErrors({ homeTeam: 'Hãy chọn đội nhà' });
      return;
    }
    if (!awayTeam) {
      setFormErrors({ awayTeam: 'Hãy chọn đội khách' });
      return;
    }
    if (homeTeam === awayTeam) {
      setFormErrors({ awayTeam: 'Hai đội phải khác nhau' });
      return;
    }
    const homeId = Number(homeTeam);
    const awayId = Number(awayTeam);
    if (matches.some((match) =>
      (match.home === homeId && match.away === awayId) ||
      (match.home === awayId && match.away === homeId))) {
      setFormErrors({ awayTeam: 'Hai đội đã đá với nhau rồi' });
      return;
    }
    if (!isValidGoals(homeGoals) || !isValidGoals(awayGoals)) {
      setFormErrors({
        ...(!isValidGoals(homeGoals) && { homeGoals: 'Số bàn thắng phải là số nguyên từ 0 đến 20' }),
        ...(!isValidGoals(awayGoals) && { awayGoals: 'Số bàn thắng phải là số nguyên từ 0 đến 20' }),
      });
      return;
    }

    dispatch({
      type: 'ADD',
      payload: {
        round: Number(round),
        home: homeId,
        away: awayId,
        homeGoals: Number(homeGoals),
        awayGoals: Number(awayGoals),
      },
    });
    setHomeTeam('');
    setAwayTeam('');
    setRound('1');
    setHomeGoals('');
    setAwayGoals('');
    setFormErrors({});
    homeSelectRef.current?.focus();
  };

  const handleRemove = (match) => {
    setDeletedMatch(match);
    dispatch({ type: 'REMOVE', payload: match.id });
  };

  const handleUndo = () => {
    if (!deletedMatch) return;
    dispatch({ type: 'RESTORE', payload: deletedMatch });
    setDeletedMatch(null);
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
    <div className="app" data-build="TH03">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand-mark" aria-hidden="true">BĐ</div>
          <div>
            <p className="eyebrow">LỊCH THI ĐẤU</p>
            <h1>Giải bóng đá khoa</h1>
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
                                dispatch({ type: 'SET_GOALS', payload: { id: match.id, field: 'homeGoals', goals: event.target.valueAsNumber } });
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
                                dispatch({ type: 'SET_GOALS', payload: { id: match.id, field: 'awayGoals', goals: event.target.valueAsNumber } });
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

        <section className="section-card form-section" aria-labelledby="add-match-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CẬP NHẬT LỊCH</p>
              <h2 id="add-match-title">Thêm trận đấu</h2>
            </div>
          </div>
          <form className="match-form" noValidate onSubmit={handleAddMatch}>
            <label>
              <span>Vòng</span>
              <select value={round} onChange={(event) => setRound(event.target.value)}>
                {ROUNDS.map((item) => <option key={item} value={item}>Vòng {item}</option>)}
              </select>
            </label>
            <label>
              <span>Đội nhà</span>
              <select ref={homeSelectRef} value={homeTeam} aria-invalid={Boolean(formErrors.homeTeam)} onChange={(event) => { setHomeTeam(event.target.value); setFormErrors({}); }}>
                <option value="">-- Chọn đội --</option>
                {TEAMS.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
              {formErrors.homeTeam && <span className="field-error" role="alert">{formErrors.homeTeam}</span>}
            </label>
            <label>
              <span>Đội khách</span>
              <select value={awayTeam} aria-invalid={Boolean(formErrors.awayTeam)} onChange={(event) => { setAwayTeam(event.target.value); setFormErrors({}); }}>
                <option value="">-- Chọn đội --</option>
                {TEAMS.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
              {formErrors.awayTeam && <span className="field-error" role="alert">{formErrors.awayTeam}</span>}
            </label>
            <label>
              <span>Bàn thắng đội nhà</span>
              <input type="number" min="0" max={MAX_GOALS} value={homeGoals} aria-invalid={Boolean(formErrors.homeGoals)} onChange={(event) => { setHomeGoals(event.target.value); setFormErrors({}); }} />
              {formErrors.homeGoals && <span className="field-error" role="alert">{formErrors.homeGoals}</span>}
            </label>
            <label>
              <span>Bàn thắng đội khách</span>
              <input type="number" min="0" max={MAX_GOALS} value={awayGoals} aria-invalid={Boolean(formErrors.awayGoals)} onChange={(event) => { setAwayGoals(event.target.value); setFormErrors({}); }} />
              {formErrors.awayGoals && <span className="field-error" role="alert">{formErrors.awayGoals}</span>}
            </label>
            <button className="button button-primary" type="submit">Thêm trận</button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default App;
