import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Brand } from '../../interfaces/brand';
import { BrandService } from '../../services/brand.service';

@Component({
  selector: 'app-products-brands',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './products-brands.html',
  styleUrl: './products-brands.css',
})
export class ProductsBrands implements OnInit {
  private readonly brandService = inject(BrandService);

  @ViewChild('brandSlider') brandSlider?: ElementRef<HTMLDivElement>;

  readonly brands = signal<Brand[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.brandService.getBrands().subscribe({
      next: (brands) => {
        this.brands.set(brands);
        this.isLoading.set(false);
      },
      error: (error: Error) => {
        this.errorMessage.set(error.message);
        this.isLoading.set(false);
      },
    });
  }

  getBrandImage(brand: Brand): string {
    return brand.image_url?.trim() || 'product-item1.png';
  }

  slideBrands(direction: 'previous' | 'next'): void {
    const slider = this.brandSlider?.nativeElement;

    if (!slider) {
      return;
    }

    const firstCard = slider.querySelector<HTMLElement>('[data-brand-card]');
    const cardWidth = firstCard?.offsetWidth ?? 300;
    const gap = 24;
    const scrollAmount = (cardWidth + gap) * (direction === 'next' ? 1 : -1);

    slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
}
