import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { MainLayout } from './layout/main-layout';
import { AuthService } from './core/auth.service';
import { of } from 'rxjs';

describe('MainLayout navigation', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayout],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { user: signal(null), logout: () => of(void 0) } },
      ],
    }).compileComponents();
  });

  it('renders the primary navigation destinations', () => {
    const fixture = TestBed.createComponent(MainLayout);
    fixture.detectChanges();
    const links = Array.from(fixture.nativeElement.querySelectorAll('nav a')) as HTMLAnchorElement[];
    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'Dashboard', 'Spiel eintragen', 'Spielverlauf', 'Bestenliste', 'Mein Profil',
    ]);
  });

  it('does not render administration links for non-admin users', () => {
    const fixture = TestBed.createComponent(MainLayout);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Admin Panel');
  });
});
