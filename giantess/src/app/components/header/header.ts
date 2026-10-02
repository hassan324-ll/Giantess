import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBarcode,
  faBars,
  faCamera,
  faChevronDown,
  faChevronRight,
  faGlobe,
  faHeadset,
  faLaptop,
  faMagnifyingGlass,
  faMobileScreenButton,
  faPrint,
  faTag,
} from '@fortawesome/free-solid-svg-icons';
import { HEADER_CATEGORIES, HeaderCatalogCategory, HeaderCatalogSection } from './header-catalog';
import { MenuCatalogService } from '../../services/menu-catalog.service';

type HeaderCategory = HeaderCatalogCategory & {
  icon: IconDefinition;
};

type NavLink = {
  label: string;
  route: string;
};

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header implements OnInit, OnDestroy {
  private readonly menuCatalogService = inject(MenuCatalogService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly logoPath = 'logo-header.png';
  protected readonly searchPlaceholder = 'Search model / part no.';

  protected readonly categories = signal<HeaderCategory[]>(this.mapCatalogToHeaderCategories(HEADER_CATEGORIES));

  protected readonly utilityLinks: NavLink[] = [
    { label: 'About Us', route: '/about' },
    { label: 'Contact Us', route: '/contact' },
  ];

  protected readonly activeCategoryId = signal(this.categories()[0].id);
  protected readonly activeMegaCategoryId = signal(this.categories()[0].id);

  protected readonly isSidebarOpen = signal(false);
  protected readonly isMegaMenuOpen = signal(false);
  protected readonly isAccountMenuOpen = signal(false);

  protected readonly activeCategory = computed(
    () => this.categories().find((category) => category.id === this.activeCategoryId()) ?? this.categories()[0],
  );

  protected readonly activeMegaCategory = computed(
    () => this.categories().find((category) => category.id === this.activeMegaCategoryId()) ?? this.categories()[0],
  );

  protected readonly faBars = faBars;
  protected readonly faChevronDown = faChevronDown;
  protected readonly faChevronRight = faChevronRight;
  protected readonly faHeadset = faHeadset;
  protected readonly faGlobe = faGlobe;
  protected readonly faMagnifyingGlass = faMagnifyingGlass;
  private megaMenuCloseTimer: ReturnType<typeof setTimeout> | null = null;
  private catalogRefreshTimer: ReturnType<typeof setInterval> | null = null;
  private pendingCategories: HeaderCategory[] | null = null;
  private readonly handleMenuCatalogStorage = (event: StorageEvent): void => {
    if (event.key === 'giantess-menu-catalog-version') {
      this.menuCatalogService.invalidateCatalog(false);
    }
  };

  ngOnInit(): void {
    this.loadMenuCatalog('live');
    this.catalogRefreshTimer = setInterval(() => this.loadMenuCatalog('live'), 30 * 60 * 1000);
    this.menuCatalogService.catalogInvalidated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadMenuCatalog('live', true));
    window.addEventListener('storage', this.handleMenuCatalogStorage);
  }

  ngOnDestroy(): void {
    this.clearMegaMenuCloseTimer();
    this.clearCatalogRefreshTimer();
    window.removeEventListener('storage', this.handleMenuCatalogStorage);
  }

  private loadMenuCatalog(source: 'menu' | 'live', forceRefresh = false): void {
    this.menuCatalogService.getCatalog(HEADER_CATEGORIES, source, { forceRefresh }).subscribe({
      next: (catalog) => {
        const categories = this.mapCatalogToHeaderCategories(catalog);

        if (!categories.length) {
          return;
        }

        this.setMenuCategories(categories);
      },
    });
  }

  protected toggleSidebar(): void {
    this.isSidebarOpen.update((open) => !open);
  }

  protected closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  protected setActiveCategory(categoryId: string): void {
    this.activeCategoryId.set(categoryId);
  }

  protected closeMegaMenu(): void {
    this.clearMegaMenuCloseTimer();
    this.isMegaMenuOpen.set(false);
    this.applyPendingCategories();
  }

  protected scheduleMegaMenuClose(): void {
    this.clearMegaMenuCloseTimer();
    this.megaMenuCloseTimer = setTimeout(() => {
      this.isMegaMenuOpen.set(false);
      this.megaMenuCloseTimer = null;
      this.applyPendingCategories();
    }, 180);
  }

  protected keepMegaMenuOpen(categoryId = this.activeMegaCategoryId()): void {
    this.clearMegaMenuCloseTimer();
    this.openMegaMenu(categoryId);
  }

  protected submitSearch(event: Event, value: string): void {
    event.preventDefault();

    const query = value.trim();

    if (!query) {
      return;
    }

    this.closeMegaMenu();
    this.closeSidebar();
    this.router.navigate(['/search'], { queryParams: { q: query } });
  }

  protected toggleMegaMenu(categoryId: string): void {
    if (this.isMegaMenuOpen() && this.activeMegaCategoryId() === categoryId) {
      this.closeMegaMenu();
      return;
    }

    this.openMegaMenu(categoryId);
  }

  protected openMegaMenu(categoryId = this.activeMegaCategoryId()): void {
    this.clearMegaMenuCloseTimer();
    this.activeMegaCategoryId.set(categoryId);
    this.isMegaMenuOpen.set(true);
  }

  protected getMegaSectionClass(section: HeaderCatalogSection): string {
    const itemCount = section.items.length;

    if (itemCount > 48) {
      return 'header-mega-menu__section--xlarge';
    }

    if (itemCount > 24) {
      return 'header-mega-menu__section--large';
    }

    if (itemCount > 12) {
      return 'header-mega-menu__section--medium';
    }

    return '';
  }

  protected getMegaItemsClass(section: HeaderCatalogSection): string {
    const itemCount = section.items.length;

    if (itemCount > 48) {
      return 'header-mega-menu__items--4';
    }

    if (itemCount > 24) {
      return 'header-mega-menu__items--3';
    }

    if (itemCount > 12) {
      return 'header-mega-menu__items--2';
    }

    return '';
  }

  private getBrandDisplayName(category: HeaderCatalogCategory): string {
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

  private getCategoryIcon(categoryId: string): IconDefinition {
    const icons: Record<string, IconDefinition> = {
      'motorola-zebra': faLaptop,
      honeywall: faBarcode,
      datalogic: faCamera,
      intermec: faPrint,
      urovo: faMobileScreenButton,
      'tsc-bluebird': faPrint,
      'zenove-accessory': faTag,
      'other-brands': faGlobe,
    };

    return icons[categoryId] ?? faTag;
  }

  private mapCatalogToHeaderCategories(catalog: HeaderCatalogCategory[]): HeaderCategory[] {
    return catalog.map((category) => ({
      ...category,
      name: this.getBrandDisplayName(category),
      icon: this.getCategoryIcon(category.id),
    }));
  }

  private setMenuCategories(categories: HeaderCategory[]): void {
    if (this.isMegaMenuOpen()) {
      this.pendingCategories = categories;
      return;
    }

    this.categories.set(categories);
    this.keepActiveCategoryIdsInRange(categories);
  }

  private applyPendingCategories(): void {
    if (!this.pendingCategories?.length) {
      return;
    }

    const categories = this.pendingCategories;
    this.pendingCategories = null;
    this.categories.set(categories);
    this.keepActiveCategoryIdsInRange(categories);
  }

  private keepActiveCategoryIdsInRange(categories: HeaderCategory[]): void {
    if (!categories.some((category) => category.id === this.activeCategoryId())) {
      this.activeCategoryId.set(categories[0].id);
    }

    if (!categories.some((category) => category.id === this.activeMegaCategoryId())) {
      this.activeMegaCategoryId.set(categories[0].id);
    }
  }

  private clearMegaMenuCloseTimer(): void {
    if (this.megaMenuCloseTimer) {
      clearTimeout(this.megaMenuCloseTimer);
      this.megaMenuCloseTimer = null;
    }
  }

  private clearCatalogRefreshTimer(): void {
    if (this.catalogRefreshTimer) {
      clearInterval(this.catalogRefreshTimer);
      this.catalogRefreshTimer = null;
    }
  }
}
