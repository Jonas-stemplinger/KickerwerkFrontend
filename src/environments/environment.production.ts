import { ApiContract } from '../app/core/api-contract';

export const environment = {
  production: true,
  apiContract: {
    baseUrl: 'https://kickerwerkapi.runasp.net',
    endpoints: {
      login: 'api/auth/login',
      logout: 'api/auth/logout',
      currentUser: 'api/auth/me',
      register: 'api/auth/register',
      dashboard: '',
      games: 'api/games',
      createGame: 'api/games',
      players: 'api/users/search',
      leaderboard: 'api/leaderboard',
      profile: '',
      pendingUsers: 'api/admin/pending-users',
      approveUser: 'api/admin/users/{id}/approve',
      loginLog: 'api/admin/login-logs',
      adminLeaderboard: 'api/admin/leaderboard',
    },
  } satisfies ApiContract,
};
