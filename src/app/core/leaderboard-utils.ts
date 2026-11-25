import { LeaderboardEntry } from './models';

export function sortLeaderboard(
  entries: readonly LeaderboardEntry[],
  search: string,
  sortBy: 'wins' | 'winRate',
): LeaderboardEntry[] {
  const query = search.trim().toLocaleLowerCase();
  return entries
    .filter((entry) => !query || entry.name.toLocaleLowerCase().includes(query))
    .slice()
    .sort((a, b) => {
      const primary = sortBy === 'winRate' ? b.winRate - a.winRate : b.wins - a.wins;
      return primary || b.wins - a.wins || a.name.localeCompare(b.name);
    });
}
