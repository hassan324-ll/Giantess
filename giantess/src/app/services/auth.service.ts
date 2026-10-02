import { Injectable, computed, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, tap, timeout } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { AuthResponse } from '../interfaces/auth-response';
import { User } from '../interfaces/user';
import { DashboardStatsService } from './dashboard-stats.service';
import { apiErrorHandler } from '../core/api-error';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = environment.apiUrl;
  private readonly authRequestTimeoutMs = 15000;
  private readonly tokenKey = 'giantess_admin_token';
  private readonly userKey = 'giantess_user';
  private readonly token = signal<string | null>(localStorage.getItem(this.tokenKey));
  user = signal<User | null>(this.getStoredUser());
  isLoggedIn = computed(() => Boolean(this.token()));

  constructor(
    private http: HttpClient,
    private router: Router,
    private dashboardStatsService: DashboardStatsService
  ) {}

  private postWithFallback<T>(primaryPath: string, fallbackPath: string, payload: unknown): Observable<T> {
    const request = (path: string) =>
      this.http.post<T>(`${this.baseUrl}/${path}`, payload).pipe(timeout(this.authRequestTimeoutMs));

    return request(primaryPath).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          return request(fallbackPath);
        }
        return throwError(() => error);
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.postWithFallback<AuthResponse>('login', 'auth/login', { email, password }).pipe(
      tap((response) => {
        const token = response.token || (response as any).access_token || '';
        localStorage.setItem(this.tokenKey, token);
        this.token.set(token);
        this.setUser(response.user);
      }),
      catchError(apiErrorHandler)
    );
  }

  sendVerificationCode(email: string): Observable<any> {
    return this.postWithFallback<any>('auth/send-verification-code', 'send-verification-code', { email }).pipe(
      catchError(apiErrorHandler)
    );
  }

  verifyCode(email: string, verificationCode: string): Observable<any> {
    return this.postWithFallback<any>('auth/verify-code', 'verify-code', {
      email,
      verification_code: verificationCode,
      code: verificationCode,
    }).pipe(catchError(apiErrorHandler));
  }

  changePassword(payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/admin/profile`, {
      current_password: payload.current_password,
      new_password: payload.password,
      new_password_confirmation: payload.password_confirmation,
    }).pipe(
      timeout(this.authRequestTimeoutMs),
      catchError(apiErrorHandler)
    );
  }

  register(payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    verification_code?: string;
    code?: string;
    is_admin?: boolean;
    admin_secret?: string;
  }): Observable<AuthResponse> {
    const requestPayload = {
      ...payload,
      ...(payload.verification_code || payload.code
        ? { code: payload.verification_code ?? payload.code }
        : {}),
    };

    const registerRequest = payload.is_admin
      ? this.http.post<AuthResponse>(`${this.baseUrl}/admin/register`, requestPayload).pipe(
          catchError((error) => {
            if (error instanceof HttpErrorResponse && error.status === 404) {
              return throwError(() => new Error('Admin registration route /admin/register was not found. Please add this backend route so admin creation can skip email verification.'));
            }

            return throwError(() => error);
          }),
        )
      : this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, requestPayload).pipe(
          catchError((error) => {
            if (error instanceof HttpErrorResponse && error.status === 404) {
              return this.http.post<AuthResponse>(`${this.baseUrl}/register`, requestPayload);
            }

            return throwError(() => error);
          }),
        );

    return registerRequest.pipe(
      catchError((error) => {
        if (
          payload.is_admin &&
          error instanceof HttpErrorResponse &&
          error.status === 422 &&
          this.hasVerificationCodeError(error)
        ) {
          return throwError(() => new Error('Admin registration endpoint is still requiring a verification code. Please update the backend admin registration route to skip email verification.'));
        }

        return throwError(() => error);
      }),
      tap((response) => {
        const token = response.token || (response as any).access_token || '';
        localStorage.setItem(this.tokenKey, token);
        this.token.set(token);
        this.setUser(response.user);
      }),
      catchError(apiErrorHandler)
    );
  }

  logout(redirect = true): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.token.set(null);
    this.dashboardStatsService.clearCache();
    this.user.set(null);
    if (redirect) {
      this.router.navigate(['/admin-login']);
    }
  }

  setAdminSession(token: string, user: User): void {
    localStorage.setItem(this.tokenKey, token);
    this.token.set(token);
    this.setUser(user);
  }

  getToken(): string | null {
    return this.token();
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  fetchMe(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/auth/me`).pipe(
      tap((user) => this.setUser(user)),
      catchError(apiErrorHandler)
    );
  }

  private setUser(user: User | null): void {
    this.user.set(user);

    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
      return;
    }

    localStorage.removeItem(this.userKey);
  }

  private getStoredUser(): User | null {
    const storedUser = localStorage.getItem(this.userKey);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }

  private hasVerificationCodeError(error: HttpErrorResponse): boolean {
    const errorText = JSON.stringify(error.error ?? '').toLowerCase();
    return errorText.includes('verification') && errorText.includes('code');
  }
}
