import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly logoPath = 'logo.png';
  readonly faEnvelope = faEnvelope;
  readonly faLock = faLock;
  readonly faEye = faEye;
  readonly faEyeSlash = faEyeSlash;
  readonly faUserPlus = faUserPlus;

  isRegisterMode = signal(false);

  loginForm = this.fb.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    password_confirmation: ['']
  });

  showPassword = signal(false);
  isLoading = signal(false);
  loginError = signal('');

  toggleMode(): void {
    this.isRegisterMode.set(!this.isRegisterMode());
    const nameControl = this.loginForm.controls.name;
    const confirmationControl = this.loginForm.controls.password_confirmation;

    if (this.isRegisterMode()) {
      nameControl.setValidators([Validators.required, Validators.minLength(2)]);
      confirmationControl.setValidators([Validators.required]);
    } else {
      nameControl.clearValidators();
      confirmationControl.clearValidators();
    }

    nameControl.updateValueAndValidity();
    confirmationControl.updateValueAndValidity();
    this.loginError.set('');
  }

  onSubmit(): void {
    if (this.isRegisterMode()) {
      this.onRegister();
      return;
    }
    this.onLogin();
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loginError.set('');
    this.isLoading.set(true);

    const { email, password } = this.loginForm.value as { email: string; password: string };

    this.authService.login(email.trim().toLowerCase(), password.trim()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/admin-dashboard/home']).catch(() => {
          this.loginError.set('Unable to open the admin dashboard. Please try again.');
        });
      },
      error: (error) => {
        this.loginError.set(error.message || 'Unable to sign in. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  onRegister(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loginError.set('');
    this.isLoading.set(true);

    const { name, email, password, password_confirmation } = this.loginForm.value as {
      name: string;
      email: string;
      password: string;
      password_confirmation: string;
    };

    this.authService.register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      password_confirmation: password_confirmation.trim(),
      is_admin: true
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/admin-dashboard/home']).catch(() => {
          this.loginError.set('Unable to open the admin dashboard. Please try again.');
        });
      },
      error: (error) => {
        this.loginError.set(error.message || 'Unable to create admin account.');
        this.isLoading.set(false);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }
}
