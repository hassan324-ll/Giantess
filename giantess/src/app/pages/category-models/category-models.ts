import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, distinctUntilChanged, finalize, map, switchMap } from 'rxjs/operators';
import { DeviceModel } from '../../interfaces/device-model';
import { Category } from '../../interfaces/category';
import { Brand } from '../../interfaces/brand';
import { CategoryService } from '../../services/category.service';
import { ModelService } from '../../services/model.service';

@Component({
  selector: 'app-category-models',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './category-models.html',
  styleUrl: './category-models.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryModels implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly categoryService = inject(CategoryService);
  private readonly modelService = inject(ModelService);
  private readonly destroyRef = inject(DestroyRef);

  readonly brandSlug = signal('');
  readonly categorySlug = signal('');
  readonly category = signal<Category | null>(null);
  readonly brand = signal<Brand | null>(null);
  readonly models = signal<DeviceModel[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  readonly fallbackModelImage = 'product-item1.png';

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => ({
          brandSlug: params.get('brandSlug') ?? '',
          categorySlug: params.get('categorySlug') ?? '',
        })),
        distinctUntilChanged(
          (previous, current) =>
            previous.brandSlug === current.brandSlug && previous.categorySlug === current.categorySlug,
        ),
        switchMap(({ brandSlug, categorySlug }) => {
          this.brandSlug.set(brandSlug);
          this.categorySlug.set(categorySlug);
          this.category.set(null);
          this.brand.set(null);
          this.models.set([]);
          this.errorMessage.set('');
          this.isLoading.set(true);

          return forkJoin({
            categories: this.categoryService.getCategories(brandSlug).pipe(catchError(() => of([]))),
            models: this.modelService.getModels(categorySlug).pipe(
              catchError((error: Error) => {
                this.errorMessage.set(error.message);
                return of([]);
              }),
            ),
          }).pipe(finalize(() => this.isLoading.set(false)));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ categories, models }) => {
        const selectedCategory = categories.find((category) => category.slug === this.categorySlug()) ?? null;
        this.category.set(selectedCategory);
        this.brand.set(selectedCategory?.brand ?? categories[0]?.brand ?? null);
        this.models.set(models);
      });
  }

  getBrandName(): string {
    return this.brand()?.name ?? this.formatSlug(this.brandSlug());
  }

  getCategoryName(): string {
    return this.category()?.name ?? this.formatSlug(this.categorySlug());
  }

  getModelImage(model: DeviceModel): string {
    return model.image_url?.trim() || model.image?.trim() || this.fallbackModelImage;
  }

  useFallbackImage(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (!image.src.endsWith(this.fallbackModelImage)) {
      image.src = this.fallbackModelImage;
    }
  }

  private formatSlug(slug: string): string {
    return slug
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
