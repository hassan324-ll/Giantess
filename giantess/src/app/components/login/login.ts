import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCircleCheck,
  faEnvelope,
  faEye,
  faEyeSlash,
  faLock,
  faShieldHalved,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../services/auth.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly logoPath = 'logo.png';
  protected readonly isCreateMode = signal(false);
  protected readonly showCreatePasswords = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly isSendingCode = signal(false);
  protected readonly verificationMessage = signal('');
  protected readonly verificationError = signal('');
  protected readonly verificationCooldown = signal(0);
  protected readonly formMessage = signal('');
  protected readonly formError = signal('');

  private verificationCooldownTimer: number | null = null;

  protected readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected readonly createForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    verification_code: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', Validators.required],
    agreed: [false, Validators.requiredTrue],
  });

  protected readonly faUser = faUser;
  protected readonly faEnvelope = faEnvelope;
  protected readonly faLock = faLock;
  protected readonly faShieldHalved = faShieldHalved;
  protected readonly faCircleCheck = faCircleCheck;
  protected readonly faEye = faEye;
  protected readonly faEyeSlash = faEyeSlash;

  protected setCreateMode(value: boolean): void {
    this.isCreateMode.set(value);
    this.formError.set('');
    this.formMessage.set('');
  }

  protected toggleCreatePasswords(): void {
    this.showCreatePasswords.update((value) => !value);
  }

  protected onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.formError.set('');
    this.formMessage.set('');
    this.isLoading.set(true);

    const { email, password } = this.loginForm.getRawValue();

    this.authService.login(email ?? '', password ?? '').subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/home']);
      },
      error: (error: Error) => {
        this.formError.set(error.message || 'Unable to login. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  protected onCreateAccount(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const { name, email, password, password_confirmation, verification_code } = this.createForm.getRawValue();

    if (password !== password_confirmation) {
      this.formError.set('Passwords do not match.');
      return;
    }

    if (!verification_code?.trim()) {
      this.verificationError.set('Please enter the verification code sent to your email.');
      return;
    }

    this.formError.set('');
    this.verificationError.set('');
    this.formMessage.set('');
    this.isLoading.set(true);

    this.authService
      .register({
        name: name ?? '',
        email: (email ?? '').trim(),
        password: password ?? '',
        password_confirmation: password_confirmation ?? '',
        verification_code: verification_code?.trim() ?? '',
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/home']);
        },
        error: (error: Error) => {
          this.formError.set(error.message || 'Unable to create account. Please try again.');
          this.isLoading.set(false);
        },
      });
  }

  protected requestVerificationCode(): void {
    const email = this.createForm.get('email')?.value;

    if (!email || this.createForm.controls.email.invalid) {
      this.formError.set('Please enter a valid email address first.');
      return;
    }

    if (this.verificationCooldown() > 0) {
      this.verificationError.set(`Please wait ${this.verificationCooldown()} seconds before requesting another code.`);
      return;
    }

    this.formError.set('');
    this.verificationError.set('');
    this.formMessage.set('');
    this.verificationMessage.set('');
    this.isSendingCode.set(true);

    this.authService.sendVerificationCode(email).subscribe({
      next: (response) => {
        this.verificationMessage.set(response?.message || 'Verification code sent to your email.');
        this.isSendingCode.set(false);
        this.startVerificationCooldown(60);
      },
      error: (error: Error) => {
        this.verificationError.set(error.message || 'Unable to send verification code. Please try again.');
        this.isSendingCode.set(false);
        this.startVerificationCooldown(30);
      },
    });
  }

  private startVerificationCooldown(seconds: number): void {
    this.verificationCooldown.set(seconds);

    if (this.verificationCooldownTimer) {
      window.clearInterval(this.verificationCooldownTimer);
    }

    this.verificationCooldownTimer = window.setInterval(() => {
      this.verificationCooldown.update((value) => {
        const next = value - 1;
        if (next <= 0) {
          if (this.verificationCooldownTimer) {
            window.clearInterval(this.verificationCooldownTimer);
            this.verificationCooldownTimer = null;
          }
          return 0;
        }
        return next;
      });
    }, 1000);
  }
}
