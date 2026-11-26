import './App.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RESULT_LABELS, ROUNDS, formatDiff } from './data';
import { removeMatch, restoreMatch, setGoals, setMatches } from './features/matchesSlice';
import useFetch from './hooks/useFetch';
import useDebounce from './hooks/useDebounce';
import useLocalStorage from './hooks/useLocalStorage';
import { calcMatchStats, getTeamName, isValidGoals } from './utils';
import { selectMatches, selectStandings } from './selectors';
import { useNotice } from './context/NoticeContext';
import { useTheme } from './context/ThemeContext';
import { hasSavedMatches } from './store';
import AddMatchForm from './components/AddMatchForm';
import GoalPlanner from './components/GoalPlanner';
import MatchRow from './components/MatchRow';
import StandingsTable from './components/StandingsTable';

const App = () => {
  const matches = useSelector(selectMatches);
  const standings = useSelector(selectStandings);
  const dispatch = useDispatch();
  const { showNotice } = useNotice();
  const { theme, toggleTheme } = useTheme();
  const [roundFilter, setRoundFilter] = useLocalStorage('ltw_bongda_round', 'all');
  const [search, setSearch] = useState('');
  const [deletedMatch, setDeletedMatch] = useState(null);
  const searchRef = useRef(null);
  const debouncedSearch = useDebounce(search, 300);
  const { data, loading, error } = useFetch('/data/matches.json');

  useEffect(() => {
    if (Array.isArray(data) && !hasSavedMatches) {
      dispatch(setMatches(data));
    }
  }, [data, dispatch]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const isEditing = target instanceof Element && (
        target.matches('input, textarea, select') || target.isContentEditable
      );

      if (event.key === '/' && !isEditing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === 'Escape' && document.activeElement === searchRef.current) {
        setSearch('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const roundMatches = useMemo(
    () => (roundFilter === 'all'
      ? matches
      : matches.filter((match) => match.round === Number(roundFilter))),
    [matches, roundFilter],
  );
  const visibleMatches = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return roundMatches;

    return roundMatches.filter((match) =>
      getTeamName(match.home).toLowerCase().includes(query) ||
      getTeamName(match.away).toLowerCase().includes(query));
  }, [roundMatches, debouncedSearch]);
  const stats = useMemo(() => calcMatchStats(roundMatches), [roundMatches]);
  const leader = useMemo(
    () => (matches.length > 0 ? standings[0] : null),
    [matches.length, standings],
  );
  const showLoading = !hasSavedMatches && loading;
  const showFetchError = !hasSavedMatches && error;

  useEffect(() => {
    document.title = leader
      ? `${leader.name} dẫn đầu – Giải bóng đá khoa`
      : 'Giải bóng đá khoa';
  }, [leader]);

  const handleRemove = useCallback((match) => {
    setDeletedMatch(match);
    dispatch(removeMatch(match.id));
    showNotice(`Đã xóa trận ${getTeamName(match.home)} - ${getTeamName(match.away)}`);
  }, [dispatch, showNotice]);

  const handleGoalsChange = useCallback((match, field, goals) => {
    if (!isValidGoals(goals)) return;
    dispatch(setGoals({
      id: match.id,
      homeGoals: field === 'homeGoals' ? goals : match.homeGoals,
      awayGoals: field === 'awayGoals' ? goals : match.awayGoals,
    }));
  }, [dispatch]);

  const handleResetSample = useCallback(() => {
    if (!Array.isArray(data)) return;
    dispatch(setMatches(data));
    setDeletedMatch(null);
    showNotice('Đã đặt lại dữ liệu mẫu');
  }, [data, dispatch, showNotice]);

  const handleTeamShift = useCallback((event) => {
    setSearch(event.target.value);
  }, [setSearch]);

  const handleUndo = () => {
    if (!deletedMatch) return;
    dispatch(restoreMatch(deletedMatch));
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
    <div className={`app ${theme}`} data-build="TH03">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand-mark" aria-hidden="true">MHP</div>
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
          <div className="result-distribution">
            <h3>Phân bố kết quả</h3>
            {[
              ['home', RESULT_LABELS.home],
              ['draw', RESULT_LABELS.draw],
              ['away', RESULT_LABELS.away],
            ].map(([key, label]) => (
              <div className="distribution-line" key={key}>
                <span>{label}: {stats.counts[key]}</span>
                <span className="distribution-track" aria-hidden="true">
                  <span className="distribution-bar" style={{ width: `${stats.counts[key] * 24}px` }} />
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="section-card" aria-labelledby="fixtures-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">KẾT QUẢ THI ĐẤU</p>
              <h2 id="fixtures-title">Lịch thi đấu</h2>
            </div>
            <div className="header-actions">
              {deletedMatch && (
                <button className="button button-secondary" type="button" onClick={handleUndo}>
                  Hoàn tác
                </button>
              )}
              <button
                className="button button-secondary"
                type="button"
                onClick={handleResetSample}
                disabled={!Array.isArray(data)}
              >
                Đặt lại dữ liệu mẫu
              </button>
            </div>
          </div>

          <div className="search-row">
            <label className="search-field">
              <span>Tìm đội</span>
              <input
                ref={searchRef}
                type="search"
                value={search}
                aria-label="Tìm đội"
                placeholder="Nhập tên đội..."
                onChange={handleTeamShift}
              />
            </label>
            <span className="result-count">Tìm thấy {visibleMatches.length} trận</span>
          </div>

          {showLoading && <p className="notice">Đang tải lịch thi đấu...</p>}
          {showFetchError && <p className="notice notice-error" role="alert">Không tải được lịch thi đấu.</p>}

          {!showLoading && !showFetchError && visibleMatches.length === 0 ? (
            <p className="empty-state">Chưa có trận đấu nào</p>
          ) : !showLoading && !showFetchError ? (
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
                    <th scope="col">Số lần render</th>
                    <th scope="col"><span className="visually-hidden">Thao tác</span></th>
                  </tr>
                </thead>
                <tbody>
                  {visibleMatches.map((match) => (
                    <MatchRow
                      key={match.id}
                      match={match}
                      onGoals={handleGoalsChange}
                      onRemove={handleRemove}
                    />
                  ))}
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
