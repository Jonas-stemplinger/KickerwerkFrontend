export type UserRole = 'User' | 'Admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistrationRequest {
  name: string;
  email: string;
  password: string;
}

export interface GameRequest {
  greenPlayerOneId: string | null;
  greenPlayerTwoId: string | null;
  yellowPlayerOneId: string | null;
  yellowPlayerTwoId: string | null;
  winner: 'green' | 'yellow';
}

export interface PlayerOption {
  id: string;
  name: string;
}

export interface GameRecord {
  id: string;
  date: string;
  greenPlayers: string[];
  yellowPlayers: string[];
  winner: 'green' | 'yellow';
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface DashboardData {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  rank: number | null;
  recentGames: GameRecord[];
}

export interface ProfileData {
  name: string;
  email: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  rank: number | null;
}

export interface PendingUser {
  id: string;
  name: string;
}

export interface LoginEvent {
  userName: string;
  dateTime: string;
}
