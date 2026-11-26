import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TEAMS } from '../data';
import { setRemaining, setTarget, setTeamId } from '../features/goalSlice';
import { selectGoal } from '../selectors';
import { calcNeeded } from '../utils';

const GoalPlanner = ({ standings }) => {
  const dispatch = useDispatch();
  const goal = useSelector(selectGoal);
  const result = useMemo(
    () => calcNeeded(standings, goal.teamId, goal.target, goal.remaining),
    [standings, goal.teamId, goal.target, goal.remaining],
  );

  return (
    <section className="section-card goal-section" aria-labelledby="goal-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">KẾ HOẠCH ĐIỂM</p>
          <h2 id="goal-title">Mục tiêu điểm</h2>
        </div>
      </div>
      <div className="goal-controls">
        <label>
          <span>Đội</span>
          <select value={goal.teamId} onChange={(event) => dispatch(setTeamId(event.target.value))}>
            {TEAMS.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
        </label>
        <label>
          <span>Số điểm mục tiêu</span>
          <input type="number" min="0" value={goal.target} onChange={(event) => dispatch(setTarget(event.target.value))} />
        </label>
        <label>
          <span>Số trận còn lại</span>
          <input type="number" min="1" value={goal.remaining} onChange={(event) => dispatch(setRemaining(event.target.value))} />
        </label>
      </div>
      <p className={`goal-result goal-${result.kind}`} aria-live="polite">{result.message}</p>
    </section>
  );
};

export default GoalPlanner;
