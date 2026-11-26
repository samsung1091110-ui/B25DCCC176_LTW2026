import { MAX_GOALS, POINTS, TEAMS } from './data';

export const getTeamName = (id) => TEAMS.find((team) => team.id === id)?.name ?? '';

export const getResult = (match) => {
  if (match.homeGoals > match.awayGoals) return 'home';
  if (match.homeGoals < match.awayGoals) return 'away';
  return 'draw';
};

export const isValidGoals = (value) => {
  if (value === '' || value === null || value === undefined) return false;
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
