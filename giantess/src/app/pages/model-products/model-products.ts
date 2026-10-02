import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, finalize, map, shareReplay, switchMap } from 'rxjs/operators';
import { Brand } from '../../interfaces/brand';
import { Category } from '../../interfaces/category';
import { DeviceModel } from '../../interfaces/device-model';
import { Product } from '../../interfaces/product';
import { CategoryService } from '../../services/category.service';
import { ModelService } from '../../services/model.service';
import { ProductService } from '../../services/product.service';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-model-products',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinner],
  templateUrl: './model-products.html',
  styleUrl: './model-products.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelProducts implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly categoryService = inject(CategoryService);
  private readonly modelService = inject(ModelService);
  private readonly productService = inject(ProductService);
  private readonly destroyRef = inject(DestroyRef);

  readonly brandSlug = signal('');
  readonly categorySlug = signal('');
  readonly modelSlug = signal('');
  readonly brand = signal<Brand | null>(null);
  readonly category = signal<Category | null>(null);
  readonly model = signal<DeviceModel | null>(null);
  readonly products = signal<Product[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  readonly productImage = 'product-image.webp';

  readonly totalProducts = computed(() => this.products().length);

  ngOnInit(): void {
    const routeContext$ = this.route.paramMap.pipe(
      map((params) => ({
        brandSlug: params.get('brandSlug') ?? '',
        categorySlug: params.get('categorySlug') ?? '',
        modelSlug: params.get('modelSlug') ?? '',
      })),
      distinctUntilChanged(
        (previous, current) =>
          previous.brandSlug === current.brandSlug &&
          previous.categorySlug === current.categorySlug &&
          previous.modelSlug === current.modelSlug,
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    routeContext$
      .pipe(
        switchMap((context) => {
          this.resetPageState(context);
          return this.loadPage(context.brandSlug, context.categorySlug, context.modelSlug).pipe(
            finalize(() => this.isLoading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((state) => this.applyLoadedState(state));
  }

  getBrandName(): string {
    return this.brand()?.name ?? this.formatSlug(this.brandSlug());
  }

  getCategoryName(): string {
    return this.category()?.name ?? this.formatSlug(this.categorySlug());
  }

  getModelName(): string {
    return this.model()?.name ?? '';
  }

  getProductDescription(product: Product): string {
    return product.description?.trim() || 'Reliable replacement part for professional barcode and data-capture workflows.';
  }

  getProductImage(product: Product): string {
    return product.thumbnail_url || product.webp_image_url || product.optimized_image_url || product.image_url || product.image || this.productImage;
  }

  getProductPrice(product: Product): string {
    const numericPrice = Number(product.price);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return 'Quote on request';
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericPrice);
  }

  getStockLabel(product: Product): string {
    const stock = Number(product.stock_count ?? 0);
    return Number.isFinite(stock) && stock > 0 ? 'In stock' : 'Not in stock';
  }

  getStockBadgeClass(product: Product): string {
    const stock = Number(product.stock_count ?? 0);
    const baseClass = 'absolute right-3 top-3 z-10 rounded-full px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] shadow-sm';
    return Number.isFinite(stock) && stock > 0
      ? `${baseClass} bg-emerald-50 text-emerald-700`
      : `${baseClass} bg-rose-50 text-rose-700`;
  }

  private resetPageState(context: { brandSlug: string; categorySlug: string; modelSlug: string }): void {
    this.brandSlug.set(context.brandSlug);
    this.categorySlug.set(context.categorySlug);
    this.modelSlug.set(context.modelSlug);
    this.brand.set(null);
    this.category.set(null);
    this.model.set(null);
    this.products.set([]);
    this.errorMessage.set('');
    this.isLoading.set(true);
  }

  private loadPage(
    brandSlug: string,
    categorySlug: string,
    modelSlug: string,
  ): Observable<{
    brand: Brand | null;
    category: Category | null;
    model: DeviceModel | null;
    products: Product[];
    categorySlug: string;
    modelSlug: string;
    errorMessage: string;
  }> {
    return this.categoryService.getCategories(brandSlug).pipe(
      catchError(() => of([] as Category[])),
      switchMap((categories) => {
        const selectedCategory = this.resolveCategory(categories, categorySlug);
        const resolvedCategorySlug = selectedCategory?.slug ?? categorySlug;
        const brand = selectedCategory?.brand ?? categories[0]?.brand ?? null;

        if (!selectedCategory) {
          return this.loadProducts(modelSlug).pipe(
            map((productState) => ({
              ...productState,
              brand,
              category: null,
              model: null,
              categorySlug,
              modelSlug,
            })),
          );
        }

        return this.modelService.getModels(resolvedCategorySlug).pipe(
          catchError(() => of([] as DeviceModel[])),
          switchMap((models) => {
            const selectedModel = this.resolveModel(models, modelSlug);
            const resolvedModelSlug = selectedModel?.slug ?? modelSlug;

            return this.loadProducts(resolvedModelSlug).pipe(
              map((productState) => ({
                ...productState,
                brand,
                category: selectedCategory,
                model: selectedModel,
                categorySlug: resolvedCategorySlug,
                modelSlug: resolvedModelSlug,
              })),
            );
          }),
        );
      }),
    );
  }

  private loadProducts(
    modelSlug: string,
  ): Observable<{ products: Product[]; errorMessage: string }> {
    return this.productService.getAllProducts(modelSlug).pipe(
      map((products) => ({
        products,
        errorMessage: '',
      })),
      catchError((error: Error) => {
        if (this.isMissingModelError(error.message)) {
          return of({
            products: [],
            errorMessage: '',
          });
        }

        return of({
          products: [],
          errorMessage: 'Unable to load product information right now. Please try again later.',
        });
      }),
    );
  }

  private applyLoadedState(state: {
    brand: Brand | null;
    category: Category | null;
    model: DeviceModel | null;
    products: Product[];
    categorySlug: string;
    modelSlug: string;
    errorMessage: string;
  }): void {
    this.brand.set(state.brand);
    this.category.set(state.category);
    this.model.set(state.model);
    this.categorySlug.set(state.categorySlug);
    this.modelSlug.set(state.modelSlug);
    this.applyProductsState(state);
  }

  private applyProductsState(state: {
    products: Product[];
    errorMessage: string;
  }): void {
    this.products.set(state.products);
    this.errorMessage.set(state.errorMessage);
  }

  private isMissingModelError(message: string): boolean {
    return message.includes('No query results for model [App\\Models\\DeviceModel]');
  }

  private resolveCategory(categories: Category[], routeCategorySlug: string): Category | null {
    const routeLookup = this.toLookupValue(routeCategorySlug);

    return (
      categories.find((category) => category.slug === routeCategorySlug) ??
      categories.find((category) => this.toLookupValue(category.slug) === routeLookup) ??
      categories.find((category) => this.toLookupValue(category.name) === routeLookup) ??
      categories.find((category) => this.toLookupValue(category.slug).endsWith(routeLookup)) ??
      categories.find((category) => this.hasMatchingTokens(category.name, routeCategorySlug)) ??
      null
    );
  }

  private resolveModel(models: DeviceModel[], routeModelSlug: string): DeviceModel | null {
    const routeLookup = this.toModelLookupValue(routeModelSlug);

    return (
      models.find((model) => model.slug === routeModelSlug) ??
      models.find((model) => this.toModelLookupValue(model.slug) === routeLookup) ??
      models.find((model) => this.toModelLookupValue(model.name) === routeLookup) ??
      models.find((model) => this.toModelLookupValue(model.slug).startsWith(routeLookup)) ??
      models.find((model) => this.toModelLookupValue(model.name).startsWith(routeLookup)) ??
      models.find((model) => this.hasMatchingTokens(model.name, routeModelSlug)) ??
      null
    );
  }

  private hasMatchingTokens(apiValue: string, routeValue: string): boolean {
    const apiTokens = this.toLookupTokens(apiValue);
    const routeTokens = this.toLookupTokens(routeValue);

    return routeTokens.length > 0 && routeTokens.every((token) => apiTokens.includes(token));
  }

  private toModelLookupValue(value: string): string {
    return this.toLookupTokens(value)
      .filter((token) => token !== 'device' && token !== 'devices')
      .join('-');
  }

  private toLookupValue(value: string): string {
    return this.toLookupTokens(value).join('-');
  }

  private toLookupTokens(value: string): string[] {
    return value
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/®/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((token) => (token.endsWith('s') && token.length > 3 ? token.slice(0, -1) : token));
  }

  private formatSlug(slug: string): string {
    return slug
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
