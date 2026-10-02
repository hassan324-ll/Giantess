import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-spinner" [ngClass]="size">
      <div class="spinner-ring"></div>
      <div class="spinner-label" *ngIf="label">{{ label }}</div>
    </div>
  `,
  styles: [
    `
      .loading-spinner {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
      }

      .spinner-ring {
        width: 32px;
        height: 32px;
        border: 4px solid rgba(0, 0, 0, 0.12);
        border-top-color: #2563eb;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      .loading-spinner.small .spinner-ring {
        width: 20px;
        height: 20px;
        border-width: 3px;
      }

      .loading-spinner.large .spinner-ring {
        width: 48px;
        height: 48px;
        border-width: 5px;
      }

      .spinner-label {
        font-size: 0.95rem;
        color: #334155;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `
  ]
})
export class LoadingSpinner {
  @Input() label = 'Loading...';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
}
