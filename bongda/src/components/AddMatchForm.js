import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MAX_GOALS, ROUNDS, TEAMS } from '../data';
import { addMatch } from '../features/matchesSlice';
import { selectMatches } from '../selectors';
import { useNotice } from '../context/NoticeContext';
import { getTeamName, isValidGoals } from '../utils';

const AddMatchForm = () => {
  const dispatch = useDispatch();
  const matches = useSelector(selectMatches);
  const { showNotice } = useNotice();
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [round, setRound] = useState('1');
  const [homeGoals, setHomeGoals] = useState('');
  const [awayGoals, setAwayGoals] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const homeSelectRef = useRef(null);

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
    const alreadyPlayed = matches.some((match) =>
      (match.home === homeId && match.away === awayId) ||
      (match.home === awayId && match.away === homeId));
    if (alreadyPlayed) {
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

    dispatch(addMatch({
      round: Number(round),
      home: homeId,
      away: awayId,
      homeGoals: Number(homeGoals),
      awayGoals: Number(awayGoals),
    }));
    showNotice(`Đã thêm trận ${getTeamName(homeId)} - ${getTeamName(awayId)}`);
    setHomeTeam('');
    setAwayTeam('');
    setRound('1');
    setHomeGoals('');
    setAwayGoals('');
    setFormErrors({});
    homeSelectRef.current?.focus();
  };

  return (
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
  );
};

export default AddMatchForm;
