import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiConfigurationError, ApiOperation } from '../core/api-contract';
import { AdminService } from '../core/admin.service';
import { AuthService } from '../core/auth.service';
import { GameService } from '../core/game.service';
import { LeaderboardService } from '../core/leaderboard.service';
import { sortLeaderboard } from '../core/leaderboard-utils';
import { DashboardData, GameRecord, LeaderboardEntry, LoginEvent, PendingUser, ProfileData } from '../core/models';
import { UserService as UserDataService } from '../core/user.service';
import { Observable } from 'rxjs';

type PageKind = 'dashboard' | 'games' | 'leaderboard' | 'profile' | 'approvals' | 'login-log' | 'admin-leaderboard';
type PageData = DashboardData | GameRecord[] | LeaderboardEntry[] | PendingUser[] | LoginEvent[] | ProfileData | null;

const pageConfig: Record<PageKind, { title: string; eyebrow: string; operation: ApiOperation; description: string }> = {
  dashboard: { title: 'Dashboard', eyebrow: 'ÜBERSICHT', operation: 'dashboard', description: 'Deine persönliche Spielstatistik auf einen Blick.' },
  games: { title: 'Spielverlauf', eyebrow: 'PARTIEN', operation: 'games', description: 'Alle bisherigen Begegnungen und Ergebnisse.' },
  leaderboard: { title: 'Bestenliste', eyebrow: 'RANGLISTE', operation: 'leaderboard', description: 'Vergleiche deine Ergebnisse mit deinem Team.' },
  profile: { title: 'Mein Profil', eyebrow: 'KONTO', operation: 'profile', description: 'Deine persönlichen Spielerinformationen.' },
  approvals: { title: 'Benutzerfreigabe', eyebrow: 'ADMIN PANEL', operation: 'pendingUsers', description: 'Offene Registrierungen zur Freigabe.' },
  'login-log': { title: 'Login-Protokoll', eyebrow: 'ADMIN PANEL', operation: 'loginLog', description: 'Erfolgreiche Anmeldungen.' },
  'admin-leaderboard': { title: 'Bestenliste verwalten', eyebrow: 'ADMIN PANEL', operation: 'adminLeaderboard', description: 'Ranglistendaten verwalten.' },
};

@Component({
  selector: 'app-workspace-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './workspace-page.html',
  styleUrl: './workspace-page.scss',
})
export class WorkspacePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly admin = inject(AdminService);
  private readonly gamesService = inject(GameService);
  private readonly leaderboardService = inject(LeaderboardService);
  private readonly usersService = inject(UserDataService);
  protected readonly auth = inject(AuthService);
  protected readonly kind = this.route.snapshot.data['kind'] as PageKind;
  protected readonly config = pageConfig[this.kind];
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly data = signal<PageData>(null);
  protected readonly search = signal('');
  protected readonly sort = signal<'date' | 'oldest' | 'wins' | 'winRate'>('date');
  protected readonly dashboard = computed(() => {
    const data = this.data();
    return this.kind === 'dashboard' && data !== null && !Array.isArray(data) ? data as DashboardData : null;
  });
  protected readonly profile = computed(() => {
    const data = this.data();
    return this.kind === 'profile' && data !== null && !Array.isArray(data) ? data as ProfileData : null;
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    const request: Observable<PageData> = this.kind === 'dashboard' ? this.usersService.dashboard()
      : this.kind === 'games' ? this.gamesService.list()
      : this.kind === 'leaderboard' ? this.leaderboardService.list()
      : this.kind === 'profile' ? this.usersService.profile()
      : this.kind === 'approvals' ? this.admin.pendingUsers()
      : this.kind === 'login-log' ? this.admin.loginLog()
      : this.leaderboardService.listForAdministration();
    request.subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(error instanceof ApiConfigurationError
          ? 'Die Backend-Schnittstelle ist noch nicht konfiguriert. Bitte zuerst den API-Vertrag abstimmen.'
          : 'Die Daten konnten nicht geladen werden. Bitte versuche es erneut.');
      },
    });
  }

  isDashboard(data: PageData): data is DashboardData {
    return this.kind === 'dashboard' && data !== null && !Array.isArray(data);
  }

  games(data: PageData): GameRecord[] {
    return this.kind === 'games' && Array.isArray(data) ? data as GameRecord[] : [];
  }

  leaderboard(data: PageData): LeaderboardEntry[] {
    return (this.kind === 'leaderboard' || this.kind === 'admin-leaderboard') && Array.isArray(data)
      ? data as LeaderboardEntry[] : [];
  }

  approvals(data: PageData): PendingUser[] {
    return this.kind === 'approvals' && Array.isArray(data) ? data as PendingUser[] : [];
  }

  loginEvents(data: PageData): LoginEvent[] {
    return this.kind === 'login-log' && Array.isArray(data) ? data as LoginEvent[] : [];
  }

  filteredGames(): GameRecord[] {
    const query = this.search().trim().toLocaleLowerCase();
    return this.games(this.data())
      .filter((game) => !query || [...game.greenPlayers, ...game.yellowPlayers].some((name) => name.toLocaleLowerCase().includes(query)))
      .sort((a, b) => this.sort() === 'date' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
  }

  sortedLeaderboard(): LeaderboardEntry[] {
    const sortBy = this.sort() === 'winRate' ? 'winRate' : 'wins';
    return sortLeaderboard(this.leaderboard(this.data()), this.search(), sortBy);
  }

  approve(id: string): void {
    this.admin.approveUser(id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Der Benutzer konnte nicht freigeschaltet werden. Bitte versuche es erneut.'),
    });
  }

  setSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  setSort(event: Event): void {
    this.sort.set((event.target as HTMLSelectElement).value as 'date' | 'oldest' | 'wins' | 'winRate');
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' }).format(new Date(date));
  }
}
