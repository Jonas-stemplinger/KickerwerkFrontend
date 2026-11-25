import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { ApiClient } from './api-client.service';
import { GameService } from './game.service';
import { LeaderboardService } from './leaderboard.service';
import { DashboardData, ProfileData } from './models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiClient);
  private readonly games = inject(GameService);
  private readonly leaderboard = inject(LeaderboardService);

  dashboard(): Observable<DashboardData> {
    return forkJoin({
      current: this.api.get<{ id: string; name: string; email: string; roles: string[] }>('currentUser'),
      games: this.games.list(),
      leaderboard: this.leaderboard.list(),
    }).pipe(map(({ current, games, leaderboard }) => {
      const entry = leaderboard.find((item) => item.userId === current.id);
      return {
        gamesPlayed: entry?.gamesPlayed ?? 0,
        wins: entry?.wins ?? 0,
        losses: entry?.losses ?? 0,
        winRate: entry?.winRate ?? 0,
        rank: leaderboard.findIndex((item) => item.userId === current.id) + 1 || null,
        recentGames: games,
      };
    }));
  }

  profile(): Observable<ProfileData> {
    return forkJoin({
      current: this.api.get<{ id: string; name: string; email: string; roles: string[] }>('currentUser'),
      leaderboard: this.leaderboard.list(),
    }).pipe(map(({ current, leaderboard }) => {
      const entry = leaderboard.find((item) => item.userId === current.id);
      const rank = leaderboard.findIndex((item) => item.userId === current.id);
      return {
        name: current.name,
        email: current.email,
        gamesPlayed: entry?.gamesPlayed ?? 0,
        wins: entry?.wins ?? 0,
        losses: entry?.losses ?? 0,
        winRate: entry?.winRate ?? 0,
        rank: rank >= 0 ? rank + 1 : null,
      };
    }));
  }
}
