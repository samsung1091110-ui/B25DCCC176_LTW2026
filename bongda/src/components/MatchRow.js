import { memo, useRef } from 'react';
import { MAX_GOALS, RESULT_LABELS } from '../data';
import { getResult, getTeamName } from '../utils';

const MatchRow = memo(({ match, onGoals, onRemove }) => {
  const renderCount = useRef(0);
  renderCount.current += 1;

  const result = getResult(match);
  const homeName = getTeamName(match.home);
  const awayName = getTeamName(match.away);

  return (
    <tr className={result === 'draw' ? 'draw-row' : ''}>
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
          onChange={(event) => onGoals(match, 'homeGoals', event.target.valueAsNumber)}
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
          onChange={(event) => onGoals(match, 'awayGoals', event.target.valueAsNumber)}
        />
      </td>
      <td>{awayName}</td>
      <td><span className={`result-label result-${result}`}>{RESULT_LABELS[result]}</span></td>
      <td className="render-count">{renderCount.current}</td>
      <td>
        <button
          className="icon-button"
          type="button"
          aria-label={`Xóa trận ${homeName} - ${awayName}`}
          onClick={() => onRemove(match)}
        >
          Xóa
        </button>
      </td>
    </tr>
  );
});

export default MatchRow;
