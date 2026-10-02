import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';
import { Product } from '../interfaces/product';
import { Pagination } from '../interfaces/pagination';
import { apiErrorHandler } from '../core/api-error';
import { retryTransientErrors, withRequestTimeout } from '../core/http-request-policy';
import { environment } from '../../environments/environment';

interface ProductListResponse {
  data: Product[];
  meta: Pagination;
}

type ProductDetailResponse = Product | { data: Product };

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly baseUrl = environment.apiUrl;
  private readonly productListCache = new Map<string, Observable<ProductListResponse>>();
  private readonly productDetailCache = new Map<string, Observable<Product>>();

  constructor(private http: HttpClient) {}

  getProducts(deviceModelIdentifier: number | string, page = 1, search = ''): Observable<ProductListResponse> {
    const cacheKey = this.getProductListCacheKey(deviceModelIdentifier, page, search);
    const cachedProducts = this.productListCache.get(cacheKey);
    if (cachedProducts) {
      return cachedProducts;
    }

    const params = new HttpParams()
      .set('page', page.toString())
      .set('search', search || '');

    const request$ = this.http
      .get<ProductListResponse>(`${this.baseUrl}/products/${deviceModelIdentifier}`, { params })
      .pipe(
        withRequestTimeout(),
        retryTransientErrors(),
        tap({ error: () => this.productListCache.delete(cacheKey) }),
        shareReplay({ bufferSize: 1, refCount: false }),
        catchError(apiErrorHandler)
      );

    this.productListCache.set(cacheKey, request$);
    return request$;
  }

  getAllProducts(deviceModelIdentifier: number | string, search = ''): Observable<Product[]> {
    return this.getProducts(deviceModelIdentifier, 1, search).pipe(
      switchMap((response) => {
        const firstPage = response.data;
        const pagination = response.meta;

        if (!pagination || pagination.last_page <= 1) {
          return of(firstPage);
        }

        const remainingPages = Array.from(
          { length: pagination.last_page - pagination.current_page },
          (_, index) => pagination.current_page + index + 1
        );

        return forkJoin(remainingPages.map((page) => this.getProducts(deviceModelIdentifier, page, search))).pipe(
          map((responses) => firstPage.concat(responses.flatMap((pageResponse) => pageResponse.data)))
        );
      }),
      catchError(apiErrorHandler)
    );
  }

  getProduct(idOrSlug: number | string): Observable<Product> {
    const cacheKey = String(idOrSlug);
    const cachedProduct = this.productDetailCache.get(cacheKey);
    if (cachedProduct) {
      return cachedProduct;
    }

    const request$ = this.http
      .get<ProductDetailResponse>(`${this.baseUrl}/product/${idOrSlug}`)
      .pipe(
        withRequestTimeout(),
        retryTransientErrors(),
        map((response) => ('data' in response ? response.data : response)),
        tap({ error: () => this.productDetailCache.delete(cacheKey) }),
        shareReplay({ bufferSize: 1, refCount: false }),
        catchError(apiErrorHandler)
      );

    this.productDetailCache.set(cacheKey, request$);
    return request$;
  }

  createProduct(payload: FormData): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/admin/products`, payload).pipe(
      tap(() => this.clearProductCaches()),
      catchError(apiErrorHandler)
    );
  }

  updateProduct(idOrSlug: number | string, payload: FormData): Observable<Product> {
    payload.append('_method', 'PATCH');
    return this.http.post<Product>(`${this.baseUrl}/admin/products/${idOrSlug}`, payload).pipe(
      tap(() => this.clearProductCaches()),
      catchError(apiErrorHandler)
    );
  }

  deleteProduct(idOrSlug: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/products/${idOrSlug}`).pipe(
      tap(() => this.clearProductCaches()),
      catchError(apiErrorHandler)
    );
  }

  private getProductListCacheKey(deviceModelIdentifier: number | string, page: number, search: string): string {
    return [deviceModelIdentifier, page, search.trim().toLowerCase()].join('|');
  }

  private clearProductCaches(): void {
    this.productListCache.clear();
    this.productDetailCache.clear();
  }
}
