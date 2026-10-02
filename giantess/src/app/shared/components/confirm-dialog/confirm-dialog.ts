import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="confirm-overlay" *ngIf="visible">
      <div class="confirm-panel">
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <div class="confirm-actions">
          <button type="button" class="btn btn-secondary" (click)="cancel.emit()">Cancel</button>
          <button type="button" class="btn btn-danger" (click)="confirm.emit()">Delete</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .confirm-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }

      .confirm-panel {
        width: min(520px, calc(100% - 1.5rem));
        background: #ffffff;
        padding: 1.5rem;
        border-radius: 14px;
        box-shadow: 0 24px 60px rgba(15, 23, 42, 0.16);
      }

      .confirm-panel h3 {
        margin: 0 0 0.5rem;
        font-size: 1.2rem;
      }

      .confirm-panel p {
        margin: 0 1rem 1.5rem;
        color: #475569;
      }

      .confirm-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
      }

      .btn {
        min-width: 96px;
        border: none;
        border-radius: 8px;
        padding: 0.7rem 1rem;
        cursor: pointer;
      }

      .btn-secondary {
        background: #f8fafc;
        color: #334155;
      }

      .btn-danger {
        background: #dc2626;
        color: #ffffff;
      }
    `
  ]
})
export class ConfirmDialog {
  @Input() visible = false;
  @Input() title = 'Confirm delete';
  @Input() message = 'Are you sure you want to delete this record? This action cannot be undone.';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
