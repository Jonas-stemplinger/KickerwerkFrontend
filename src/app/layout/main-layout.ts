import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  protected readonly auth = inject(AuthService);
  protected readonly menuOpen = signal(false);
  protected readonly logoutError = signal('');
  private readonly router = inject(Router);

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.logoutError.set('');
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.logoutError.set('Die Abmeldung ist fehlgeschlagen. Bitte versuche es erneut.'),
    });
  }
}
