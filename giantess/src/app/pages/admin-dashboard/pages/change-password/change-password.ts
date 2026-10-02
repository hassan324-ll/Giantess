import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../../services/auth.service';
import './change-password.css';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePassword {
  readonly faEye = faEye;
  readonly faEyeSlash = faEyeSlash;

  readonly form = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  readonly isSaving = signal(false);
  readonly showCurrentPassword = signal(false);
  readonly showNewPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');

  constructor(private authService: AuthService) {}

  toggleCurrentPassword(): void {
    this.showCurrentPassword.update((visible) => !visible);
  }

  toggleNewPassword(): void {
    this.showNewPassword.update((visible) => !visible);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((visible) => !visible);
  }

  submit(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (!this.form.currentPassword || !this.form.newPassword || !this.form.confirmPassword) {
      this.errorMessage.set('Please complete all password fields.');
      return;
    }

    if (this.form.newPassword.length < 8) {
      this.errorMessage.set('New password must be at least 8 characters.');
      return;
    }

    if (this.form.newPassword !== this.form.confirmPassword) {
      this.errorMessage.set('New password and confirmation do not match.');
      return;
    }

    this.isSaving.set(true);
    this.authService
      .changePassword({
        current_password: this.form.currentPassword,
        password: this.form.newPassword,
        password_confirmation: this.form.confirmPassword,
      })
      .subscribe({
        next: () => {
          this.form.currentPassword = '';
          this.form.newPassword = '';
          this.form.confirmPassword = '';
          this.successMessage.set('Password updated successfully.');
          this.isSaving.set(false);
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message || 'Unable to update password.');
          this.isSaving.set(false);
        },
      });
  }
}
