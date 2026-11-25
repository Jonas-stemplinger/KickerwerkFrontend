import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiClient } from './api-client.service';
import { LeaderboardEntry } from './models';

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  private readonly api = inject(ApiClient);

  list(): Observable<LeaderboardEntry[]> {
    return this.api.get<Array<{ playerId: string; name: string; gamesPlayed: number; wins: number; losses: number; winRate: number }>>('leaderboard').pipe(
      map((entries) => entries.map((entry) => ({ ...entry, userId: entry.playerId }))),
    );
  }

  listForAdministration(): Observable<LeaderboardEntry[]> {
    return this.api.get<Array<{ playerId: string; name: string; gamesPlayed: number; wins: number; losses: number; winRate: number }>>('adminLeaderboard').pipe(
      map((entries) => entries.map((entry) => ({ ...entry, userId: entry.playerId }))),
    );
  }
}
