import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faCheckCircle,
  faChevronLeft,
  faChevronRight,
  faEnvelope,
  faPercent,
  faMinus,
  faPlus,
  faShieldHalved,
  faTruckFast,
} from '@fortawesome/free-solid-svg-icons';
import { of } from 'rxjs';
import { catchError, distinctUntilChanged, finalize, map, switchMap } from 'rxjs/operators';
import { HEADER_CATEGORIES, HeaderCatalogCategory, HeaderCatalogSection } from '../../components/header/header-catalog';
import { Product } from '../../interfaces/product';
import { ProductService } from '../../services/product.service';

const DEFAULT_PAGE_TITLE = 'GIANTESS Barcode Soluitions';

const PRODUCT_SEO_METADATA: Record<string, { title: string; description: string }> = {
  'lcd-touch-screen-replacement-for-urovo-dt50s-android-11-dt50s-1779339651163-4': {
    title: 'LCD Touch Screen Replacement for Urovo DT50S Android 11',
    description:
      'Buy LCD touch screen replacement for Urovo DT50S Android 11. High-quality spare part for reliable repair, clear display, and smooth touch response.',
  },
  'motorola-zebra-ps20j-touch-screen-replacement-ps20j-1778746217357-2333': {
    title: 'Motorola Symbol Zebra PS20J Touch Screen Replacement',
    description:
      'Buy a durable touch screen replacement for Motorola Symbol Zebra PS20J. Designed for precise touch response, easy installation, and reliable PDA repair.',
  },
  'motorola-zebra-ps20j-lcd-module-replacement-ps20j-1778746217357-2331': {
    title: 'Motorola Zebra PS20J LCD Module Replacement',
    description:
      'Buy a high-quality LCD module replacement for Motorola Zebra PS20J. Designed to restore clear display performance, durability, and reliable PDA repair.',
  },
  'motorola-zebra-tc51-lcd-touch-screen-replacement-module-tc51-1778746217357-2489': {
    title: 'Motorola Zebra TC51 LCD Touch Screen Replacement Module',
    description:
      'Buy a Motorola Zebra TC51 LCD touch screen replacement module designed for clear display, smooth touch response, precise fit, and reliable PDA repair.',
  },
};

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetail implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  @ViewChild('relatedSlider') private relatedSlider?: ElementRef<HTMLElement>;

  readonly brandSlug = signal('');
  readonly categorySlug = signal('');
  readonly modelSlug = signal('');
  readonly productSlug = signal('');
  readonly product = signal<Product | null>(null);
  readonly relatedProducts = signal<Product[]>([]);
  readonly relatedSlideIndex = signal(0);
  readonly selectedImageIndex = signal(0);
  readonly expandedBrandIds = signal<Set<string>>(new Set());
  readonly expandedCategoryKeys = signal<Set<string>>(new Set());
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly catalog = HEADER_CATEGORIES;
  readonly productImage = 'product-image.webp';
  private readonly relatedSlideSize = 5;

  readonly faArrowLeft = faArrowLeft;
  readonly faCheckCircle = faCheckCircle;
  readonly faChevronLeft = faChevronLeft;
  readonly faChevronRight = faChevronRight;
  readonly faEnvelope = faEnvelope;
  readonly faPercent = faPercent;
  readonly faMinus = faMinus;
  readonly faPlus = faPlus;
  readonly faShieldHalved = faShieldHalved;
  readonly faTruckFast = faTruckFast;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => ({
          brandSlug: params.get('brandSlug') ?? '',
          categorySlug: params.get('categorySlug') ?? '',
          modelSlug: params.get('modelSlug') ?? '',
          productSlug: params.get('productSlug') ?? '',
        })),
        distinctUntilChanged(
          (previous, current) =>
            previous.brandSlug === current.brandSlug &&
            previous.categorySlug === current.categorySlug &&
            previous.modelSlug === current.modelSlug &&
            previous.productSlug === current.productSlug,
        ),
        switchMap((context) => {
          this.resetProductState(context);

          return this.productService.getProduct(context.productSlug).pipe(
            switchMap((product) => {
              const resolvedContext = this.resolveProductContext(product, context);
              this.setLoadedProduct(product, resolvedContext);
              this.updateSeoMetadata(context.productSlug);
              this.replaceLegacyProductUrl(product.slug);

              return this.productService.getProducts(
                resolvedContext.modelSlug || product.device_model_id,
                1,
              ).pipe(
                map((response) =>
                  response.data.filter((relatedProduct) => relatedProduct.id !== product.id).slice(0, 12),
                ),
                catchError(() => of([] as Product[])),
              );
            }),
            catchError((error: Error) => {
              this.errorMessage.set(error.message || 'Product details could not be found.');
              this.product.set(null);
              return of([] as Product[]);
            }),
            finalize(() => this.isLoading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((relatedProducts) => this.relatedProducts.set(relatedProducts));
  }

  ngOnDestroy(): void {
    this.resetSeoMetadata();
  }

  getProductImage(product: Product): string {
    return this.getProductImages(product)[0] ?? this.productImage;
  }

  getModelName(product?: Product | null): string {
    return product?.device_model?.name?.trim() || this.formatSlug(this.modelSlug());
  }

  getProductImages(product: Product): string[] {
    const imageValues = [
      product.webp_image_url,
      product.optimized_image_url,
      product.thumbnail_url,
      ...(product.image_urls ?? []),
      ...(product.images ?? []),
      ...(product.product_images ?? []),
      ...(product.gallery ?? []),
      ...(product.media ?? []),
      product.image_url,
      product.image,
    ];

    const images = imageValues
      .map((image) => {
        if (!image) {
          return '';
        }

        return typeof image === 'string' ? image : image.image_url ?? image.url ?? image.path ?? '';
      })
      .map((image) => image.trim())
      .filter((image, index, allImages) => image.length > 0 && allImages.indexOf(image) === index);

    return images.length ? images : [this.productImage];
  }

  getSelectedProductImage(product: Product): string {
    return this.getProductImages(product)[this.selectedImageIndex()] ?? this.getProductImage(product);
  }

  selectProductImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  getDescription(product: Product): string {
    return (
      product.description?.trim() ||
      'Reliable replacement part for professional barcode and data-capture workflows.'
    );
  }

  getSku(product: Product): string {
    return product.part_number || product.sku || `SKU-${product.id}`;
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
    }).format(numericPrice).replace('$', 'US $');
  }

  getStockLabel(product: Product): string {
    const stock = Number(product.stock_count ?? 0);
    return Number.isFinite(stock) && stock > 0 ? 'In stock' : 'Not in stock';
  }

  hasStockCount(product: Product): boolean {
    const stock = Number(product.stock_count ?? 0);
    return Number.isFinite(stock) && stock > 0;
  }

  getStockTextClass(product: Product): string {
    const stock = Number(product.stock_count ?? 0);
    return Number.isFinite(stock) && stock > 0 ? 'text-emerald-600' : 'text-rose-600';
  }

  formatSlug(slug: string): string {
    return slug
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  getBrandDisplayName(category: HeaderCatalogCategory): string {
    const displayNames: Record<string, string> = {
      'motorola-zebra': 'MOTOROLA ® ZEBRA ®',
      honeywall: 'Honeywall ®',
      datalogic: 'Datalogic ®',
      intermec: 'Intermec ®',
      urovo: 'Urovo ®',
      'tsc-bluebird': 'TSC ® Bluebird ®',
      'zenove-accessory': 'ZENOVA Accessory ®',
      'other-brands': 'Other Brands',
    };

    return displayNames[category.id] ?? category.name;
  }

  isBrandExpanded(brandId: string): boolean {
    return this.expandedBrandIds().has(brandId);
  }

  isCategoryExpanded(brandId: string, categorySlug: string): boolean {
    return this.expandedCategoryKeys().has(this.getCategoryKey(brandId, categorySlug));
  }

  toggleBrand(brandId: string): void {
    this.expandedBrandIds.update((expanded) => {
      const next = new Set(expanded);
      next.has(brandId) ? next.delete(brandId) : next.add(brandId);
      return next;
    });
  }

  toggleCategory(brandId: string, categorySlug: string): void {
    const key = this.getCategoryKey(brandId, categorySlug);

    this.expandedCategoryKeys.update((expanded) => {
      const next = new Set(expanded);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  isActiveBrand(brandId: string): boolean {
    return brandId === this.brandSlug();
  }

  isActiveCategory(brandId: string, section: HeaderCatalogSection): boolean {
    return brandId === this.brandSlug() && section.slug === this.categorySlug();
  }

  isActiveModel(brandId: string, categorySlug: string, modelSlug: string): boolean {
    return brandId === this.brandSlug() && categorySlug === this.categorySlug() && modelSlug === this.modelSlug();
  }

  canSlideRelatedPrevious(): boolean {
    return this.relatedSlideIndex() > 0;
  }

  canSlideRelatedNext(): boolean {
    return this.relatedSlideIndex() < this.getRelatedMaxSlideIndex();
  }

  showRelatedSliderControls(): boolean {
    return this.relatedProducts().length > this.relatedSlideSize;
  }

  slideRelatedPrevious(): void {
    this.relatedSlideIndex.update((index) => {
      const nextIndex = Math.max(index - 1, 0);
      this.scrollRelatedSlider(nextIndex - index);
      return nextIndex;
    });
  }

  slideRelatedNext(): void {
    this.relatedSlideIndex.update((index) => {
      const nextIndex = Math.min(index + 1, this.getRelatedMaxSlideIndex());
      this.scrollRelatedSlider(nextIndex - index);
      return nextIndex;
    });
  }

  private getCategoryKey(brandId: string, categorySlug: string): string {
    return `${brandId}:${categorySlug}`;
  }

  private getRelatedMaxSlideIndex(): number {
    return Math.max(this.relatedProducts().length - this.relatedSlideSize, 0);
  }

  private scrollRelatedSlider(direction: number): void {
    const slider = this.relatedSlider?.nativeElement;
    const firstCard = slider?.querySelector<HTMLElement>('.related-slider-card');

    if (!slider || !firstCard || direction === 0) {
      return;
    }

    const gap = 20;
    slider.scrollBy({
      left: direction * (firstCard.offsetWidth + gap),
      behavior: 'smooth',
    });
  }

  private setLoadedProduct(
    product: Product,
    context: { brandSlug: string; categorySlug: string; modelSlug: string },
  ): void {
    this.product.set(product);
    this.brandSlug.set(context.brandSlug);
    this.categorySlug.set(context.categorySlug);
    this.modelSlug.set(context.modelSlug);
    this.relatedSlideIndex.set(0);
    this.selectedImageIndex.set(0);
    this.expandedBrandIds.set(context.brandSlug ? new Set([context.brandSlug]) : new Set());
    this.expandedCategoryKeys.set(
      context.brandSlug && context.categorySlug
        ? new Set([this.getCategoryKey(context.brandSlug, context.categorySlug)])
        : new Set(),
    );
    this.errorMessage.set('');
  }

  private resolveProductContext(
    product: Product,
    routeContext: { brandSlug: string; categorySlug: string; modelSlug: string },
  ): { brandSlug: string; categorySlug: string; modelSlug: string } {
    const modelSlug = product.device_model?.slug || routeContext.modelSlug;
    const categorySlug = product.device_model?.category?.slug || routeContext.categorySlug;
    const brandSlug = product.device_model?.category?.brand?.slug || routeContext.brandSlug;

    if (brandSlug && categorySlug && modelSlug) {
      return { brandSlug, categorySlug, modelSlug };
    }

    for (const brand of this.catalog) {
      for (const section of brand.sections) {
        if (section.items.some((model) => model.slug === modelSlug)) {
          return {
            brandSlug: brandSlug || brand.id,
            categorySlug: categorySlug || section.slug,
            modelSlug,
          };
        }
      }
    }

    return { brandSlug, categorySlug, modelSlug };
  }

  private resetProductState(context: {
    brandSlug: string;
    categorySlug: string;
    modelSlug: string;
    productSlug: string;
  }): void {
    this.brandSlug.set(context.brandSlug);
    this.categorySlug.set(context.categorySlug);
    this.modelSlug.set(context.modelSlug);
    this.productSlug.set(context.productSlug);
    this.product.set(null);
    this.relatedProducts.set([]);
    this.relatedSlideIndex.set(0);
    this.selectedImageIndex.set(0);
    this.expandedBrandIds.set(new Set([context.brandSlug]));
    this.expandedCategoryKeys.set(new Set([this.getCategoryKey(context.brandSlug, context.categorySlug)]));
    this.errorMessage.set('');
    this.isLoading.set(true);
  }

  private replaceLegacyProductUrl(productSlug: string): void {
    const canonicalUrl = this.router.serializeUrl(
      this.router.createUrlTree(['/products', productSlug]),
    );

    if (this.router.url !== canonicalUrl) {
      void this.router.navigateByUrl(canonicalUrl, { replaceUrl: true });
    }
  }

  private updateSeoMetadata(productSlug: string): void {
    const metadata = PRODUCT_SEO_METADATA[productSlug];

    if (!metadata) {
      this.resetSeoMetadata();
      return;
    }

    this.titleService.setTitle(metadata.title);
    this.metaService.updateTag({ name: 'description', content: metadata.description });
  }

  private resetSeoMetadata(): void {
    this.titleService.setTitle(DEFAULT_PAGE_TITLE);
    this.metaService.removeTag('name="description"');
  }
}
