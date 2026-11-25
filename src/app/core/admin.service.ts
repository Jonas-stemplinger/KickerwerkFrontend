import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiClient } from './api-client.service';
import { LoginEvent, PendingUser } from './models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(ApiClient);

  pendingUsers(): Observable<PendingUser[]> {
    return this.api.get<{ items: PendingUser[] }>('pendingUsers').pipe(
      map((page) => page.items),
    );
  }

  approveUser(userId: string): Observable<void> {
    return this.api.post<void>('approveUser', null, { id: userId });
  }

  loginLog(): Observable<LoginEvent[]> {
    return this.api.get<{ items: Array<{ userName: string; loginAt: string }> }>('loginLog').pipe(
      map((page) => page.items.map((entry) => ({ userName: entry.userName, dateTime: entry.loginAt }))),
    );
  }
}
