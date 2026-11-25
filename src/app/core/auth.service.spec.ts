import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_CONTRACT, ApiContract } from './api-contract';
import { AuthService } from './auth.service';

const contract: ApiContract = {
  baseUrl: 'https://kickerwerkapi.runasp.net/',
  endpoints: {
    login: 'configured-login',
    logout: 'configured-logout',
    currentUser: 'configured-session',
    register: 'configured-registration',
    dashboard: 'dashboard',
    games: 'games',
    createGame: 'games',
    players: 'players',
    leaderboard: 'leaderboard',
    profile: 'profile',
    pendingUsers: 'pending',
    approveUser: 'approve',
    loginLog: 'logins',
    adminLeaderboard: 'admin/leaderboard',
  },
};

describe('AuthService', () => {
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONTRACT, useValue: contract },
      ],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends login with credentials and stores only the returned session user', () => {
    let result: unknown;
    auth.login({ email: 'player@example.test', password: 'secret' }).subscribe((user) => result = user);

    const csrf = http.expectOne('https://kickerwerkapi.runasp.net/api/auth/csrf');
    csrf.flush({ requestToken: 'test-csrf-token' });

    const login = http.expectOne('https://kickerwerkapi.runasp.net/configured-login');
    expect(login.request.method).toBe('POST');
    expect(login.request.withCredentials).toBe(true);
    expect(login.request.headers.get('X-XSRF-TOKEN')).toBe('test-csrf-token');
    expect(login.request.body).toEqual({ email: 'player@example.test', password: 'secret' });
    login.flush(null);

    const session = http.expectOne('https://kickerwerkapi.runasp.net/configured-session');
    expect(session.request.withCredentials).toBe(true);
    session.flush({ id: 'u1', name: 'Alex', email: 'player@example.test', roles: ['User'] });

    expect(result).toEqual({ id: 'u1', name: 'Alex', role: 'User' });
    expect(auth.user()).toEqual({ id: 'u1', name: 'Alex', role: 'User' });
  });
});
