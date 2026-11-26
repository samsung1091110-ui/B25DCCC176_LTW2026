import { formatDiff } from '../data';

const StandingsTable = ({ standings }) => (
  <div className="table-scroll">
    <table className="standings-table">
      <thead>
        <tr>
          <th scope="col">Hạng</th>
          <th scope="col">Đội</th>
          <th scope="col">Trận</th>
          <th scope="col">Thắng</th>
          <th scope="col">Hòa</th>
          <th scope="col">Thua</th>
          <th scope="col">BT</th>
          <th scope="col">BB</th>
          <th scope="col">HS</th>
          <th scope="col">Điểm</th>
        </tr>
      </thead>
      <tbody>
        {standings.map((team, index) => (
          <tr className={index === standings.length - 1 ? 'last-team' : ''} key={team.id}>
            <td>{index + 1}</td>
            <th scope="row">{team.name}</th>
            <td>{team.played}</td>
            <td>{team.won}</td>
            <td>{team.drawn}</td>
            <td>{team.lost}</td>
            <td>{team.goalsFor}</td>
            <td>{team.goalsAgainst}</td>
            <td>{formatDiff(team.diff)}</td>
            <td><strong>{team.points}</strong></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default StandingsTable;
