import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { firstValueFrom, isObservable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { adminGuard, authenticatedGuard } from './auth.guards';

describe('authentication guards', () => {
  it('redirects an unauthenticated user to the login page', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { checkSession: () => of(null) } }],
    });
    const result = TestBed.runInInjectionContext(() =>
      authenticatedGuard({} as ActivatedRouteSnapshot, { url: '/dashboard' } as RouterStateSnapshot),
    );
    const decision = isObservable(result) ? await firstValueFrom(result) : await result;
    expect(TestBed.inject(Router).serializeUrl(decision as UrlTree)).toContain('/login');
  });

  it('does not grant admin access to a regular user', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { checkSession: () => of({ id: 'u1', name: 'Alex', role: 'User' }) } },
      ],
    });
    const result = TestBed.runInInjectionContext(() => adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
    const decision = isObservable(result) ? await firstValueFrom(result) : await result;
    expect(TestBed.inject(Router).serializeUrl(decision as UrlTree)).toContain('/dashboard');
  });
});
