import { LeaderboardEntry } from './models';
import { sortLeaderboard } from './leaderboard-utils';

describe('sortLeaderboard', () => {
  const entries: LeaderboardEntry[] = [
    { userId: '1', name: 'Alex', gamesPlayed: 10, wins: 7, losses: 3, winRate: 70 },
    { userId: '2', name: 'Mika', gamesPlayed: 8, wins: 5, losses: 3, winRate: 62.5 },
    { userId: '3', name: 'Alexandra', gamesPlayed: 4, wins: 3, losses: 1, winRate: 75 },
  ];

  it('sorts by wins and filters names without mutating the source list', () => {
    expect(sortLeaderboard(entries, 'alex', 'wins').map((entry) => entry.userId)).toEqual(['1', '3']);
    expect(entries.map((entry) => entry.userId)).toEqual(['1', '2', '3']);
  });

  it('sorts by win rate', () => {
    expect(sortLeaderboard(entries, '', 'winRate').map((entry) => entry.userId)).toEqual(['3', '1', '2']);
  });
});
