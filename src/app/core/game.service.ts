import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiClient } from './api-client.service';
import { GameRecord, GameRequest, PlayerOption } from './models';

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly api = inject(ApiClient);

  list(): Observable<GameRecord[]> {
    return this.api.get<{
      items: Array<{
        id: number;
        createdAt: string;
        winningTeam: 'Green' | 'Yellow';
        players: Array<{ team: 'Green' | 'Yellow'; playerId: string | null; name: string | null }>;
      }>;
    }>('games').pipe(map((page) => page.items.map((game) => ({
      id: String(game.id),
      date: game.createdAt,
      greenPlayers: game.players.filter((player) => player.team === 'Green').map((player) => player.name ?? ''),
      yellowPlayers: game.players.filter((player) => player.team === 'Yellow').map((player) => player.name ?? ''),
      winner: game.winningTeam === 'Green' ? 'green' : 'yellow',
    }))));
  }

  searchPlayers(query: string): Observable<PlayerOption[]> {
    return this.api.get<PlayerOption[]>('players', { q: query });
  }

  create(request: GameRequest): Observable<void> {
    return this.api.post<void>('createGame', {
      winningTeam: request.winner === 'green' ? 'Green' : 'Yellow',
      greenPlayer1Id: request.greenPlayerOneId,
      greenPlayer2Id: request.greenPlayerTwoId,
      yellowPlayer1Id: request.yellowPlayerOneId,
      yellowPlayer2Id: request.yellowPlayerTwoId,
    });
  }
}
