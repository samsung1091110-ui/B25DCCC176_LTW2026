import { MAX_GOALS, POINTS, TEAMS } from './data';

export const getTeamName = (id) => TEAMS.find((team) => team.id === id)?.name ?? '';

export const getResult = (match) => {
  if (match.homeGoals > match.awayGoals) return 'home';
  if (match.homeGoals < match.awayGoals) return 'away';
  return 'draw';
};

export const isValidGoals = (value) => {
  if (value === '' || value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  const goals = Number(value);
  return Number.isInteger(goals) && goals >= 0 && goals <= MAX_GOALS;
};

export const calcStandings = (matches) => {
  const standings = TEAMS.map((team) => ({
    ...team,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    diff: 0,
    points: 0,
  }));

  matches.forEach((match) => {
    const home = standings.find((team) => team.id === match.home);
    const away = standings.find((team) => team.id === match.away);
    if (!home || !away) return;

    home.played += 1;
    away.played += 1;
    home.goalsFor += match.homeGoals;
    home.goalsAgainst += match.awayGoals;
    away.goalsFor += match.awayGoals;
    away.goalsAgainst += match.homeGoals;

    const result = getResult(match);
    if (result === 'home') {
      home.won += 1;
      away.lost += 1;
      home.points += POINTS.win;
    } else if (result === 'away') {
      away.won += 1;
      home.lost += 1;
      away.points += POINTS.win;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += POINTS.draw;
      away.points += POINTS.draw;
    }
  });

  return standings
    .map((team) => ({ ...team, diff: team.goalsFor - team.goalsAgainst }))
    .sort((a, b) =>
      b.points - a.points ||
      b.diff - a.diff ||
      b.goalsFor - a.goalsFor ||
      a.name.localeCompare(b.name, 'vi'),
    );
};

export const calcMatchStats = (matches) => {
  const stats = {
    count: matches.length,
    goals: 0,
    average: 0,
    counts: { home: 0, draw: 0, away: 0 },
  };

  matches.forEach((match) => {
    stats.goals += match.homeGoals + match.awayGoals;
    stats.counts[getResult(match)] += 1;
  });

  stats.average = stats.count === 0
    ? 0
    : Math.round((stats.goals / stats.count) * 100) / 100;

  return stats;
};

export const calcNeeded = (standings, teamId, target, remaining) => {
  const team = standings.find((item) => String(item.id) === String(teamId));
  const targetPoints = Number(target);
  const remainingMatches = Number(remaining);

  if (
    !team ||
    target === '' ||
    (typeof target === 'string' && target.trim() === '') ||
    !Number.isInteger(targetPoints) ||
    targetPoints < 0 ||
    remaining === '' ||
    (typeof remaining === 'string' && remaining.trim() === '') ||
    !Number.isInteger(remainingMatches) ||
    remainingMatches < 1
  ) {
    return {
      kind: 'invalid',
      message: 'Hãy chọn đội, nhập số điểm mục tiêu (từ 0) và số trận còn lại (từ 1)',
    };
  }

  const need = targetPoints - team.points;
  if (need <= 0) {
    return { kind: 'done', message: 'Đội đã đạt mục tiêu' };
  }
  if (need > 3 * remainingMatches) {
    return { kind: 'impossible', message: 'Không thể đạt mục tiêu này' };
  }

  const minimumWins = Math.max(0, Math.ceil((need - remainingMatches) / 2));
  return {
    kind: 'possible',
    message: `Cần thêm ${need} điểm ở ${remainingMatches} trận còn lại, tối thiểu ${minimumWins} trận thắng`,
  };
};
