import { InjectionToken } from '@angular/core';

export type ApiOperation =
  | 'login'
  | 'logout'
  | 'currentUser'
  | 'register'
  | 'dashboard'
  | 'games'
  | 'createGame'
  | 'players'
  | 'leaderboard'
  | 'profile'
  | 'pendingUsers'
  | 'approveUser'
  | 'loginLog'
  | 'adminLeaderboard';

export interface ApiContract {
  baseUrl: string;
  endpoints: Record<ApiOperation, string>;
}

export const API_CONTRACT = new InjectionToken<ApiContract>('API_CONTRACT', {
  providedIn: 'root',
  factory: () => ({
    baseUrl: '',
    endpoints: {
      login: '',
      logout: '',
      currentUser: '',
      register: '',
      dashboard: '',
      games: '',
      createGame: '',
      players: '',
      leaderboard: '',
      profile: '',
      pendingUsers: '',
      approveUser: '',
      loginLog: '',
      adminLeaderboard: '',
    },
  }),
});

export class ApiConfigurationError extends Error {
  constructor(operation: ApiOperation) {
    super(`Der API-Endpunkt "${operation}" ist noch nicht konfiguriert.`);
    this.name = 'ApiConfigurationError';
  }
}
