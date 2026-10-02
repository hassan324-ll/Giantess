import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../interfaces/product';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly storageKey = 'giantess_favorite_items';
  private readonly _isOpen = signal(false);
  private readonly _items = signal<Product[]>(this.getStoredItems());

  readonly isOpen = this._isOpen;
  readonly items = this._items.asReadonly();
  readonly itemCount = computed(() => this._items().length);

  open(): void {
    this._isOpen.set(true);
  }

  close(): void {
    this._isOpen.set(false);
  }

  toggle(): void {
    this._isOpen.update((open) => !open);
  }

  toggleFavorite(product: Product): void {
    this._items.update((items) =>
      this.storeItems(
        items.some((item) => item.id === product.id)
          ? items.filter((item) => item.id !== product.id)
          : [...items, product],
      ),
    );
  }

  removeFavorite(productId: number): void {
    this._items.update((items) => this.storeItems(items.filter((item) => item.id !== productId)));
  }

  isFavorite(productId: number): boolean {
    return this._items().some((item) => item.id === productId);
  }

  private storeItems(items: Product[]): Product[] {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
    return items;
  }

  private getStoredItems(): Product[] {
    const storedItems = localStorage.getItem(this.storageKey);

    if (!storedItems) {
      return [];
    }

    try {
      const parsedItems = JSON.parse(storedItems) as Product[];

      if (!Array.isArray(parsedItems)) {
        return [];
      }

      return parsedItems.filter((item) => item?.id);
    } catch {
      localStorage.removeItem(this.storageKey);
      return [];
    }
  }
}
