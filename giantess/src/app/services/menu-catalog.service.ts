import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { concat, Observable, Subject, forkJoin, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap, tap, timeout } from 'rxjs/operators';
import { HeaderCatalogCategory } from '../components/header/header-catalog';
import { Brand } from '../interfaces/brand';
import { Category } from '../interfaces/category';
import { BrandService } from './brand.service';
import { CategoryService } from './category.service';
import { ModelService } from './model.service';
import { environment } from '../../environments/environment';

type MenuCatalogResponse = HeaderCatalogCategory[] | { data: unknown };
type CatalogSource = 'menu' | 'live';

const MENU_CACHE_KEY = 'giantess-menu-catalog';
const MENU_INVALIDATION_KEY = 'giantess-menu-catalog-version';
const MENU_CACHE_TTL_MS = 30 * 60 * 1000;

@Injectable({
  providedIn: 'root',
})
export class MenuCatalogService {
  private readonly baseUrl = environment.apiUrl;
  private readonly fallbackCatalog: HeaderCatalogCategory[] = [];
  private readonly catalogInvalidatedSubject = new Subject<void>();
  private catalogRequest$?: Observable<HeaderCatalogCategory[]>;
  private catalogRequestSource?: CatalogSource;
  readonly catalogInvalidated$ = this.catalogInvalidatedSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly brandService: BrandService,
    private readonly categoryService: CategoryService,
    private readonly modelService: ModelService,
  ) {}

  getCatalog(
    fallbackCatalog: HeaderCatalogCategory[],
    source: CatalogSource = 'live',
    options: { forceRefresh?: boolean } = {},
  ): Observable<HeaderCatalogCategory[]> {
    this.fallbackCatalog.splice(0, this.fallbackCatalog.length, ...fallbackCatalog);

    if (options.forceRefresh || this.catalogRequestSource !== source) {
      this.catalogRequest$ = undefined;
      this.catalogRequestSource = source;
    }

    const cachedCatalog = options.forceRefresh ? [] : this.getCachedCatalog();
    if (cachedCatalog.length) {
      this.catalogRequest$ ??= this.getCatalogSource(source).pipe(
        tap((catalog) => this.setCachedCatalog(catalog)),
        catchError(() => of(cachedCatalog)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

      return concat(of(cachedCatalog), this.catalogRequest$);
    }

    this.catalogRequest$ ??= this.getCatalogSource(source).pipe(
      tap((catalog) => this.setCachedCatalog(catalog)),
      catchError(() => of(fallbackCatalog)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    return this.catalogRequest$;
  }

  invalidateCatalog(notifyOtherTabs = true): void {
    this.catalogRequest$ = undefined;
    this.catalogRequestSource = undefined;

    try {
      window.localStorage.removeItem(MENU_CACHE_KEY);

      if (notifyOtherTabs) {
        window.localStorage.setItem(MENU_INVALIDATION_KEY, Date.now().toString());
      }
    } catch {
      // Cache clearing is best-effort only.
    }

    this.catalogInvalidatedSubject.next();
  }

  private getCatalogSource(source: CatalogSource): Observable<HeaderCatalogCategory[]> {
    return source === 'live' ? this.buildLiveCatalog() : this.getMenuCatalogFallback();
  }

  private buildLiveCatalog(): Observable<HeaderCatalogCategory[]> {
    return this.brandService.getBrands().pipe(
      switchMap((brands) => {
        if (!brands.length) {
          return this.getMenuCatalogFallback();
        }

        return forkJoin(brands.map((brand) => this.buildBrandCatalog(brand))).pipe(
          switchMap((catalog) => (catalog.length ? of(catalog) : this.getMenuCatalogFallback())),
        );
      }),
    );
  }

  private buildBrandCatalog(brand: Brand): Observable<HeaderCatalogCategory> {
    return this.categoryService.getCategories(brand.slug).pipe(
      switchMap((categories) => {
        if (!categories.length) {
          return of({
            id: brand.slug,
            name: brand.name,
            sections: [],
          });
        }

        return forkJoin(categories.map((category) => this.buildCategorySection(category))).pipe(
          map((sections) => ({
            id: brand.slug,
            name: brand.name,
            sections,
          })),
        );
      }),
      catchError(() =>
        of({
          id: brand.slug,
          name: brand.name,
          sections: [],
        }),
      ),
    );
  }

  private buildCategorySection(category: Category): Observable<HeaderCatalogCategory['sections'][number]> {
    return this.modelService.getModels(category.slug).pipe(
      map((models) => ({
        title: category.name,
        slug: category.slug,
        items: models.map((model) => ({
          name: model.name,
          slug: model.slug,
        })),
      })),
      catchError(() =>
        of({
          title: category.name,
          slug: category.slug,
          items: [],
        }),
      ),
    );
  }

  private getMenuCatalogFallback(): Observable<HeaderCatalogCategory[]> {
    return this.http.get<MenuCatalogResponse>(`${this.baseUrl}/menu-catalog`).pipe(
      timeout(5000),
      map((response) => this.normalizeCatalog(response)),
      catchError(() => of(this.fallbackCatalog)),
    );
  }

  private normalizeCatalog(response: MenuCatalogResponse): HeaderCatalogCategory[] {
    const rawItems = Array.isArray(response) ? response : this.toArray(response.data);
    const catalog = rawItems.map((item) => this.normalizeBrand(item)).filter(Boolean) as HeaderCatalogCategory[];

    return catalog.length ? catalog : this.fallbackCatalog;
  }

  private normalizeBrand(item: unknown): HeaderCatalogCategory | null {
    const brand = this.toRecord(item);

    if (!brand) {
      return null;
    }

    const slug = this.toStringValue(brand['slug'] ?? brand['id']);
    const name = this.toStringValue(brand['name']);

    if (!slug || !name) {
      return null;
    }

    const rawCategories = this.toArray(brand['sections'] ?? brand['categories']);
    const sections = rawCategories
      .map((category) => this.normalizeCategory(category))
      .filter(Boolean) as HeaderCatalogCategory['sections'];

    return {
      id: slug,
      name,
      sections,
    };
  }

  private normalizeCategory(item: unknown): HeaderCatalogCategory['sections'][number] | null {
    const category = this.toRecord(item);

    if (!category) {
      return null;
    }

    const slug = this.toStringValue(category['slug'] ?? category['id']);
    const title = this.toStringValue(category['title'] ?? category['name']);

    if (!slug || !title) {
      return null;
    }

    const rawModels = this.toArray(category['items'] ?? category['models']);
    const items = rawModels
      .map((model) => this.normalizeModel(model))
      .filter(Boolean) as HeaderCatalogCategory['sections'][number]['items'];

    return {
      title,
      slug,
      items,
    };
  }

  private normalizeModel(item: unknown): HeaderCatalogCategory['sections'][number]['items'][number] | null {
    const model = this.toRecord(item);

    if (!model) {
      return null;
    }

    const slug = this.toStringValue(model['slug'] ?? model['id']);
    const name = this.toStringValue(model['name'] ?? model['title']);

    if (!slug || !name) {
      return null;
    }

    return { name, slug };
  }

  private getCachedCatalog(): HeaderCatalogCategory[] {
    try {
      const rawCache = window.localStorage.getItem(MENU_CACHE_KEY);

      if (!rawCache) {
        return [];
      }

      const parsed = JSON.parse(rawCache) as { expiresAt?: number; catalog?: unknown };

      if (!parsed.expiresAt || parsed.expiresAt < Date.now()) {
        window.localStorage.removeItem(MENU_CACHE_KEY);
        return [];
      }

      return this.normalizeCatalog({ data: parsed.catalog });
    } catch {
      return [];
    }
  }

  private setCachedCatalog(catalog: HeaderCatalogCategory[]): void {
    try {
      window.localStorage.setItem(
        MENU_CACHE_KEY,
        JSON.stringify({
          expiresAt: Date.now() + MENU_CACHE_TTL_MS,
          catalog,
        }),
      );
    } catch {
      // Cache is an optimization; the menu can still use the in-memory response.
    }
  }

  private toArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }

  private toRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
  }

  private toStringValue(value: unknown): string {
    return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
  }
}
