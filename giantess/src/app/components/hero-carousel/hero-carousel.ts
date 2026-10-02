import { Component, OnDestroy, computed, signal } from '@angular/core';

type CarouselSlide = {
  alt: string;
  ctaLabel: string;
  imagePath: string;
  ctaHref: string;
};

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [],
  templateUrl: './hero-carousel.html',
  styleUrl: './hero-carousel.css',
})
export class HeroCarousel implements OnDestroy {
  protected readonly slides: CarouselSlide[] = [
    {
      alt: 'Giantess hero frame 1',
      ctaLabel: 'Email GIANTESS Barcode Team',
      ctaHref: '/contact',
      imagePath: 'Frame 1.webp',
    },
    {
      alt: 'Giantess hero frame 2',
      ctaLabel: 'Browse Categories',
      ctaHref: '/home',
      imagePath: 'Frame 2.webp',
    },
    {
      alt: 'Giantess hero frame 3',
      ctaLabel: 'Email Support Team',
      ctaHref: '/contact',
      imagePath: 'Frame 3.webp',
    },
  ];

  protected readonly activeIndex = signal(0);
  protected readonly activeSlide = computed(() => this.slides[this.activeIndex()]);
  private readonly intervalId = window.setInterval(() => this.nextSlide(), 5600);

  protected goToSlide(index: number): void {
    this.activeIndex.set(index);
  }

  protected nextSlide(): void {
    this.activeIndex.update((index) => (index + 1) % this.slides.length);
  }

  ngOnDestroy(): void {
    window.clearInterval(this.intervalId);
  }
}
