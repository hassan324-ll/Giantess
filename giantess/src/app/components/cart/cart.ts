import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CartService } from '../../services/cart.service';
import { Product } from '../../interfaces/product';
import {
  faCartShopping,
  faCircleXmark,
  faTrash,
  faMinus,
  faPlus,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  private readonly cartService = inject(CartService);

  readonly isOpen = computed(() => this.cartService.isOpen());
  readonly items = computed(() => this.cartService.items());
  readonly itemCount = computed(() => this.cartService.itemCount());
  readonly subtotal = computed(() => this.cartService.formatPrice(this.cartService.subtotal()));

  readonly faCartShopping = faCartShopping;
  readonly faCircleXmark = faCircleXmark;
  readonly faTrash = faTrash;
  readonly faMinus = faMinus;
  readonly faPlus = faPlus;
  readonly faCheck = faCheck;

  close(): void {
    this.cartService.close();
  }

  increaseQty(productId: number): void {
    this.cartService.increaseQuantity(productId);
  }

  decreaseQty(productId: number): void {
    this.cartService.decreaseQuantity(productId);
  }

  removeItem(productId: number): void {
    this.cartService.removeItem(productId);
  }

  formatProductPrice(product: Product): string {
    return this.cartService.formatPrice(this.cartService.getNumericPrice(product));
  }
}
