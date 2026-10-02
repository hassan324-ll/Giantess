import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, finalize, map, switchMap } from 'rxjs/operators';
import { Brand } from '../../interfaces/brand';
import { Category } from '../../interfaces/category';
import { BrandService } from '../../services/brand.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-brand-categories',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './brand-categories.html',
  styleUrl: './brand-categories.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandCategories implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly brandService = inject(BrandService);
  private readonly categoryService = inject(CategoryService);
  private readonly destroyRef = inject(DestroyRef);

  readonly brandSlug = signal('');
  readonly brand = signal<Brand | null>(null);
  readonly categories = signal<Category[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => params.get('brandSlug') ?? ''),
        distinctUntilChanged(),
        switchMap((slug) => {
          this.brandSlug.set(slug);
          this.isLoading.set(true);
          this.errorMessage.set('');
          this.categories.set([]);
          this.brand.set(null);

          return this.loadCategoriesAndBrand(slug).pipe(finalize(() => this.isLoading.set(false)));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ categories, brand }) => {
          this.categories.set(categories);
          this.brand.set(brand);
        },
      });
  }

  getBrandName(): string {
    return this.brand()?.name ?? this.formatSlug(this.brandSlug());
  }

  getBrandImage(): string {
    return this.brand()?.image_url?.trim() || 'product-item1.png';
  }

  private loadCategoriesAndBrand(
    brandSlug: string,
  ): Observable<{ categories: Category[]; brand: Brand | null }> {
    return this.categoryService.getCategories(brandSlug).pipe(
      switchMap((categories) => {
        const brand = categories[0]?.brand ?? null;

        if (brand) {
          return of({ categories, brand });
        }

        return this.resolveBrandFallback(brandSlug).pipe(map((fallbackBrand) => ({ categories, brand: fallbackBrand })));
      }),
      catchError((error: Error) => {
        this.errorMessage.set(error.message);
        return this.resolveBrandFallback(brandSlug).pipe(map((brand) => ({ categories: [], brand })));
      }),
    );
  }

  private resolveBrandFallback(brandSlug: string): Observable<Brand | null> {
    return this.brandService.getBrands().pipe(
      map((brands) => brands.find((brand) => brand.slug === brandSlug) ?? null),
      catchError(() => of(null)),
    );
  }

  private formatSlug(slug: string): string {
    return slug
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
