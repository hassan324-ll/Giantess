import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';
import { DeviceModel } from '../interfaces/device-model';
import { Pagination } from '../interfaces/pagination';
import { apiErrorHandler } from '../core/api-error';
import { retryTransientErrors, withRequestTimeout } from '../core/http-request-policy';
import { environment } from '../../environments/environment';

interface ModelListResponse {
  data: DeviceModel[];
  meta?: Pagination;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

type ModelApiResponse = DeviceModel[] | ModelListResponse;

@Injectable({
  providedIn: 'root'
})
export class ModelService {
  private readonly baseUrl = environment.apiUrl;
  private readonly modelsCache = new Map<string, Observable<DeviceModel[]>>();
  private readonly modelCountCache = new Map<string, Observable<number>>();

  constructor(private http: HttpClient) {}

  getModels(categorySlug?: string): Observable<DeviceModel[]> {
    if (!categorySlug) {
      return of([]);
    }

    const cachedModels = this.modelsCache.get(categorySlug);
    if (cachedModels) {
      return cachedModels;
    }

    const request$ = this.getModelsPage(categorySlug, 1).pipe(
      switchMap((response) => {
        const firstPage = this.getModelData(response);
        const pagination = this.getPagination(response);

        if (!pagination || pagination.last_page <= 1) {
          return of(firstPage);
        }

        const remainingPages = Array.from(
          { length: pagination.last_page - pagination.current_page },
          (_, index) => pagination.current_page + index + 1
        );

        return forkJoin(remainingPages.map((page) => this.getModelsPage(categorySlug, page))).pipe(
          map((responses) => firstPage.concat(responses.flatMap((pageResponse) => this.getModelData(pageResponse))))
        );
      }),
      tap({ error: () => this.modelsCache.delete(categorySlug) }),
      shareReplay({ bufferSize: 1, refCount: false }),
      catchError(apiErrorHandler)
    );

    this.modelsCache.set(categorySlug, request$);
    return request$;
  }

  getModelCount(categorySlug?: string): Observable<number> {
    if (!categorySlug) {
      return of(0);
    }

    const cachedCount = this.modelCountCache.get(categorySlug);
    if (cachedCount) {
      return cachedCount;
    }

    const request$ = this.getModelsPage(categorySlug, 1).pipe(
      map((response) => {
        const pagination = this.getPagination(response);
        const data = this.getModelData(response);
        return pagination?.total ?? data.length;
      }),
      tap({ error: () => this.modelCountCache.delete(categorySlug) }),
      shareReplay({ bufferSize: 1, refCount: false }),
      catchError(() => of(0))
    );

    this.modelCountCache.set(categorySlug, request$);
    return request$;
  }

  private getModelsPage(categorySlug: string, page: number): Observable<ModelApiResponse> {
    const params = new HttpParams().set('page', page.toString());

    return this.http
      .get<ModelApiResponse>(`${this.baseUrl}/models/${categorySlug}`, { params })
      .pipe(withRequestTimeout(), retryTransientErrors());
  }

  private getModelData(response: ModelApiResponse): DeviceModel[] {
    return Array.isArray(response) ? response : response.data;
  }

  private getPagination(response: ModelApiResponse): Pagination | null {
    if (Array.isArray(response)) {
      return null;
    }

    if (response.meta) {
      return response.meta;
    }

    if (response.current_page && response.last_page && response.per_page && response.total) {
      return {
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total
      };
    }

    return null;
  }

  createModel(payload: FormData): Observable<DeviceModel> {
    return this.http.post<DeviceModel>(`${this.baseUrl}/admin/models`, payload).pipe(
      tap(() => this.clearModelCaches()),
      catchError(apiErrorHandler)
    );
  }

  updateModel(idOrSlug: number | string, payload: FormData): Observable<DeviceModel> {
    payload.append('_method', 'PATCH');
    return this.http.post<DeviceModel>(`${this.baseUrl}/admin/models/${idOrSlug}`, payload).pipe(
      tap(() => this.clearModelCaches()),
      catchError(apiErrorHandler)
    );
  }

  deleteModel(idOrSlug: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/models/${idOrSlug}`).pipe(
      tap(() => this.clearModelCaches()),
      catchError(apiErrorHandler)
    );
  }

  private clearModelCaches(): void {
    this.modelsCache.clear();
    this.modelCountCache.clear();
  }
}
