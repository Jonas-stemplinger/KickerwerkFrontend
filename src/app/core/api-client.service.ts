import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { defer, map, Observable, switchMap } from 'rxjs';
import { API_CONTRACT, ApiConfigurationError, ApiOperation } from './api-contract';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly contract = inject(API_CONTRACT);

  get<T>(operation: ApiOperation, params?: Record<string, string>): Observable<T> {
    return defer(() => {
      let httpParams = new HttpParams();
      for (const [key, value] of Object.entries(params ?? {})) {
        httpParams = httpParams.set(key, value);
      }
      return this.http.get<T>(this.resolveUrl(operation), { params: httpParams, withCredentials: true });
    });
  }

  post<T>(operation: ApiOperation, body: unknown, pathParams?: Record<string, string>): Observable<T> {
    return defer(() => this.getCsrfToken().pipe(
      switchMap((requestToken) => this.http.post<T>(
        this.resolveUrl(operation, pathParams),
        body,
        { withCredentials: true, headers: { 'X-XSRF-TOKEN': requestToken } },
      )),
    ));
  }

  put<T>(operation: ApiOperation, body: unknown, pathParams?: Record<string, string>): Observable<T> {
    return defer(() => this.getCsrfToken().pipe(
      switchMap((requestToken) => this.http.put<T>(
        this.resolveUrl(operation, pathParams),
        body,
        { withCredentials: true, headers: { 'X-XSRF-TOKEN': requestToken } },
      )),
    ));
  }

  private getCsrfToken(): Observable<string> {
    const csrfUrl = `${this.contract.baseUrl.replace(/\/+$/, '')}/api/auth/csrf`;
    return this.http.get<{ requestToken: string }>(csrfUrl, { withCredentials: true })
      .pipe(map((response) => response.requestToken));
  }

  private resolveUrl(operation: ApiOperation, pathParams?: Record<string, string>): string {
    const endpoint = this.contract.endpoints[operation];
    if (!endpoint.trim()) {
      throw new ApiConfigurationError(operation);
    }

    if (/^https?:\/\//i.test(endpoint)) {
      return endpoint;
    }

    let resolvedEndpoint = endpoint.replace(/^\/+/, '');
    for (const [key, value] of Object.entries(pathParams ?? {})) {
      resolvedEndpoint = resolvedEndpoint.replace(`{${key}}`, encodeURIComponent(value));
    }
    if (!this.contract.baseUrl.trim()) {
      return `/${resolvedEndpoint}`;
    }

    return `${this.contract.baseUrl.replace(/\/+$/, '')}/${resolvedEndpoint}`;
  }
}
