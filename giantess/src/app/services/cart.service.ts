import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../interfaces/product';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly storageKey = 'giantess_cart_items';
  private readonly _isOpen = signal(false);
  private readonly _items = signal<CartItem[]>(this.getStoredItems());

  readonly isOpen = this._isOpen;
  readonly items = this._items.asReadonly();
  readonly itemCount = computed(() =>
    this._items().reduce((count, item) => count + item.quantity, 0),
  );
  readonly subtotal = computed(() =>
    this._items().reduce((total, item) => total + this.getNumericPrice(item.product) * item.quantity, 0),
  );

  open(): void {
    this._isOpen.set(true);
  }

  close(): void {
    this._isOpen.set(false);
  }

  toggle(): void {
    this._isOpen.update((v) => !v);
  }

  addItem(product: Product): void {
    this._items.update((items) => {
      const existingItem = items.find((item) => item.product.id === product.id);

      if (existingItem) {
        return this.storeItems(items.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        ));
      }

      return this.storeItems([...items, { product, quantity: 1 }]);
    });
  }

  increaseQuantity(productId: number): void {
    this._items.update((items) =>
      this.storeItems(items.map((item) =>
        item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
      )),
    );
  }

  decreaseQuantity(productId: number): void {
    this._items.update((items) =>
      this.storeItems(items
        .map((item) =>
          item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0)),
    );
  }

  removeItem(productId: number): void {
    this._items.update((items) => this.storeItems(items.filter((item) => item.product.id !== productId)));
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: price % 1 === 0 ? 0 : 2,
    }).format(price);
  }

  getNumericPrice(product: Product): number {
    const price = typeof product.price === 'number' ? product.price : Number(product.price);
    return Number.isFinite(price) ? price : 0;
  }

  private storeItems(items: CartItem[]): CartItem[] {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
    return items;
  }

  private getStoredItems(): CartItem[] {
    const storedItems = localStorage.getItem(this.storageKey);

    if (!storedItems) {
      return [];
    }

    try {
      const parsedItems = JSON.parse(storedItems) as CartItem[];

      if (!Array.isArray(parsedItems)) {
        return [];
      }

      return parsedItems.filter((item) => item?.product?.id && item.quantity > 0);
    } catch {
      localStorage.removeItem(this.storageKey);
      return [];
    }
  }
}

