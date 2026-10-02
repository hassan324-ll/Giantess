import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, distinctUntilChanged, finalize, map, of, switchMap } from 'rxjs';
import { HeaderCatalogCategory, HEADER_CATEGORIES } from '../../components/header/header-catalog';
import { MenuCatalogService } from '../../services/menu-catalog.service';

type SearchResult = {
  brandName: string;
  brandSlug: string;
  categoryName: string;
  categorySlug: string;
  modelName: string;
  modelSlug: string;
};

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="search-results-page">
      <section class="search-results-hero">
        <p class="search-results-eyebrow">Search results</p>
        <h1>Results for "{{ query() }}"</h1>
      </section>

      <section class="search-results-shell" aria-live="polite">
        @if (isLoading()) {
          <p class="search-results-status">Loading catalog...</p>
        } @else if (!query()) {
          <p class="search-results-status">Enter a model, brand, category, or part number in the header search.</p>
        } @else if (results().length) {
          <div class="search-results-count">
            {{ results().length }} matching {{ results().length === 1 ? 'model' : 'models' }}
          </div>

          <div class="search-results-grid">
            @for (result of results(); track result.brandSlug + '-' + result.categorySlug + '-' + result.modelSlug) {
              <a
                class="search-result-card"
                [routerLink]="['/brands', result.brandSlug, 'categories', result.categorySlug, 'models', result.modelSlug, 'products']"
              >
                <span class="search-result-card__model">{{ result.modelName }}</span>
                <span class="search-result-card__meta">{{ result.brandName }} / {{ result.categoryName }}</span>
                <span class="search-result-card__action">View products</span>
              </a>
            }
          </div>
        } @else {
          <p class="search-results-status">No models matched "{{ query() }}". Try a brand name, model number, or category.</p>
        }
      </section>
    </main>
  `,
  styleUrl: './search-results.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResults implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly menuCatalogService = inject(MenuCatalogService);
  private readonly destroyRef = inject(DestroyRef);

  readonly query = signal('');
  readonly catalog = signal<HeaderCatalogCategory[]>(HEADER_CATEGORIES);
  readonly isLoading = signal(true);

  readonly results = computed(() => {
    const query = this.normalize(this.query());
    const compactQuery = this.compact(this.query());

    if (!query && !compactQuery) {
      return [];
    }

    return this.catalog()
      .flatMap((brand) =>
        brand.sections.flatMap((section) =>
          section.items.map<SearchResult>((item) => ({
            brandName: brand.name,
            brandSlug: brand.id,
            categoryName: section.title,
            categorySlug: section.slug,
            modelName: item.name,
            modelSlug: item.slug,
          })),
        ),
      )
      .filter((result) => {
        const searchableText = `${result.brandName} ${result.brandSlug} ${result.categoryName} ${result.categorySlug} ${result.modelName} ${result.modelSlug}`;
        const haystack = this.normalize(searchableText);
        const compactHaystack = this.compact(searchableText);

        return Boolean((query && haystack.includes(query)) || (compactQuery && compactHaystack.includes(compactQuery)));
      })
      .slice(0, 80);
  });

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        map((params) => params.get('q')?.trim() ?? ''),
        distinctUntilChanged(),
        switchMap((query) => {
          this.query.set(query);
          this.isLoading.set(true);

          return this.menuCatalogService.getCatalog(HEADER_CATEGORIES).pipe(
            catchError(() => of(HEADER_CATEGORIES)),
            finalize(() => this.isLoading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((catalog) => {
        this.catalog.set(catalog);
      });
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  private compact(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
  }
}
