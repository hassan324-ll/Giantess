import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Category } from '../interfaces/category';
import { apiErrorHandler } from '../core/api-error';
import { retryTransientErrors, withRequestTimeout } from '../core/http-request-policy';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly baseUrl = environment.apiUrl;
  private readonly categoryCache = new Map<string, Observable<Category[]>>();

  constructor(private http: HttpClient) {}

  getCategories(brandSlug?: string): Observable<Category[]> {
    if (!brandSlug) {
      return of([]);
    }

    const cachedCategories = this.categoryCache.get(brandSlug);
    if (cachedCategories) {
      return cachedCategories;
    }

    const request$ = this.http
      .get<Category[] | { data: Category[] }>(`${this.baseUrl}/categories/${brandSlug}`)
      .pipe(
        withRequestTimeout(),
        retryTransientErrors(),
        map((response) => ('data' in response ? response.data : response)),
        tap({ error: () => this.categoryCache.delete(brandSlug) }),
        shareReplay({ bufferSize: 1, refCount: false }),
        catchError(apiErrorHandler)
      );

    this.categoryCache.set(brandSlug, request$);
    return request$;
  }

  createCategory(payload: { name: string; slug: string; brand_id: number }): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/admin/categories`, payload).pipe(
      tap(() => this.categoryCache.clear()),
      catchError(apiErrorHandler)
    );
  }

  updateCategory(idOrSlug: number | string, payload: { name: string; slug: string; brand_id: number }): Observable<Category> {
    return this.http.patch<Category>(`${this.baseUrl}/admin/categories/${idOrSlug}`, payload).pipe(
      tap(() => this.categoryCache.clear()),
      catchError(apiErrorHandler)
    );
  }

  deleteCategory(idOrSlug: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/categories/${idOrSlug}`).pipe(
      tap(() => this.categoryCache.clear()),
      catchError(apiErrorHandler)
    );
  }
}
