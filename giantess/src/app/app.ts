import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly destroyRef = inject(DestroyRef);
  protected readonly title = signal('giantess');
  protected readonly hideHeaderFooter = signal(this.isAdminRoute(window.location.pathname));

  constructor(private router: Router) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(event => (event as NavigationEnd).urlAfterRedirects),
        startWith(this.router.url),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(url => {
        const isAdminRoute = this.isAdminRoute(url);
        this.hideHeaderFooter.set(isAdminRoute);
        document.documentElement.classList.toggle('admin-route', isAdminRoute);
      });
  }

  private isAdminRoute(url: string): boolean {
    return url.startsWith('/admin-login') || url.startsWith('/admin-dashboard');
  }
}
