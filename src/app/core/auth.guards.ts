import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';

export const authenticatedGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.checkSession().pipe(
    map((user) => user ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } })),
    catchError((error: unknown) => of(router.createUrlTree(['/login'], {
      queryParams: {
        returnUrl: state.url,
        sessionError: error instanceof Error && error.name === 'ApiConfigurationError' ? 'configuration' : 'unavailable',
      },
    }))),
  );
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.checkSession().pipe(
    map((user) => {
      if (!user) {
        return router.createUrlTree(['/login']);
      }
      return user.role === 'Admin' ? true : router.createUrlTree(['/dashboard']);
    }),
    catchError((error: unknown) => of(router.createUrlTree(['/login'], {
      queryParams: { sessionError: error instanceof Error && error.name === 'ApiConfigurationError' ? 'configuration' : 'unavailable' },
    }))),
  );
};
