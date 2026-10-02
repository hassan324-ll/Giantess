import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleXmark, faHeart, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterLink],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class Favorites {
  private readonly favoritesService = inject(FavoritesService);

  readonly isOpen = computed(() => this.favoritesService.isOpen());
  readonly items = computed(() => this.favoritesService.items());
  readonly itemCount = computed(() => this.favoritesService.itemCount());

  readonly faCircleXmark = faCircleXmark;
  readonly faHeart = faHeart;
  readonly faTrash = faTrash;

  close(): void {
    this.favoritesService.close();
  }

  removeItem(productId: number): void {
    this.favoritesService.removeFavorite(productId);
  }
}
