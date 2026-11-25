import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { ApiClient } from './api-client.service';
import { LoginRequest, RegistrationRequest, User } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiClient);
  readonly user = signal<User | null>(null);

  checkSession(): Observable<User | null> {
    return this.api.get<{ id: string; name: string; email: string; roles: string[] }>('currentUser').pipe(
      map((currentUser) => ({
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.roles.includes('Admin') ? 'Admin' as const : 'User' as const,
      })),
      tap((user) => this.user.set(user)),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
          this.user.set(null);
          return of(null);
        }
        return throwError(() => error);
      }),
    );
  }

  login(credentials: LoginRequest): Observable<User | null> {
    return this.api.post<void>('login', credentials).pipe(switchMap(() => this.checkSession()));
  }

  register(request: RegistrationRequest): Observable<void> {
    return this.api.post<void>('register', request);
  }

  logout(): Observable<void> {
    return this.api.post<void>('logout', {}).pipe(tap(() => this.user.set(null)));
  }
}
