import { Routes } from '@angular/router';
import { authenticatedGuard, adminGuard } from './core/auth.guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/main-layout').then((module) => module.MainLayout),
    canActivateChild: [authenticatedGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', data: { kind: 'dashboard' }, loadComponent: () => import('./pages/workspace-page').then((module) => module.WorkspacePage) },
      { path: 'games/new', loadComponent: () => import('./pages/game-create-page').then((module) => module.GameCreatePage) },
      { path: 'games', data: { kind: 'games' }, loadComponent: () => import('./pages/workspace-page').then((module) => module.WorkspacePage) },
      { path: 'leaderboard', data: { kind: 'leaderboard' }, loadComponent: () => import('./pages/workspace-page').then((module) => module.WorkspacePage) },
      { path: 'profile', data: { kind: 'profile' }, loadComponent: () => import('./pages/workspace-page').then((module) => module.WorkspacePage) },
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'approvals' },
          { path: 'approvals', data: { kind: 'approvals' }, loadComponent: () => import('./pages/workspace-page').then((module) => module.WorkspacePage) },
          { path: 'login-log', data: { kind: 'login-log' }, loadComponent: () => import('./pages/workspace-page').then((module) => module.WorkspacePage) },
          { path: 'leaderboard', data: { kind: 'admin-leaderboard' }, loadComponent: () => import('./pages/workspace-page').then((module) => module.WorkspacePage) },
        ],
      },
    ],
  },
  { path: 'login', data: { mode: 'login' }, loadComponent: () => import('./pages/auth-page').then((module) => module.AuthPage) },
  { path: 'register', data: { mode: 'register' }, loadComponent: () => import('./pages/auth-page').then((module) => module.AuthPage) },
  { path: '**', redirectTo: 'dashboard' },
];
