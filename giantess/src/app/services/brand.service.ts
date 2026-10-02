import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Brand } from '../interfaces/brand';
import { apiErrorHandler } from '../core/api-error';
import { retryTransientErrors, withRequestTimeout } from '../core/http-request-policy';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private readonly baseUrl = environment.apiUrl;
  private readonly brandCache = new Map<string, Observable<Brand[]>>();

  constructor(private http: HttpClient) {}

  getBrands(search = ''): Observable<Brand[]> {
    const cacheKey = search.trim().toLowerCase();
    const cachedBrands = this.brandCache.get(cacheKey);
    if (cachedBrands) {
      return cachedBrands;
    }

    const params = new HttpParams().set('search', search || '');

    const request$ = this.http
      .get<Brand[] | { data: Brand[] }>(`${this.baseUrl}/brands`, { params })
      .pipe(
        withRequestTimeout(),
        retryTransientErrors(),
        map(mapBrandsResponse),
        tap({ error: () => this.brandCache.delete(cacheKey) }),
        shareReplay({ bufferSize: 1, refCount: false }),
        catchError(apiErrorHandler)
      );

    this.brandCache.set(cacheKey, request$);
    return request$;
  }

  createBrand(formData: FormData): Observable<Brand> {
    return this.http.post<Brand>(`${this.baseUrl}/admin/brands`, formData).pipe(
      tap(() => this.brandCache.clear()),
      catchError(apiErrorHandler)
    );
  }

  updateBrand(idOrSlug: number | string, formData: FormData): Observable<Brand> {
    formData.append('_method', 'PATCH');
    return this.http.post<Brand>(`${this.baseUrl}/admin/brands/${idOrSlug}`, formData).pipe(
      tap(() => this.brandCache.clear()),
      catchError(apiErrorHandler)
    );
  }

  deleteBrand(idOrSlug: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/brands/${idOrSlug}`).pipe(
      tap(() => this.brandCache.clear()),
      catchError(apiErrorHandler)
    );
  }
}

function mapBrandsResponse(response: Brand[] | { data: Brand[] }): Brand[] {
  return 'data' in response ? response.data : response;
}
