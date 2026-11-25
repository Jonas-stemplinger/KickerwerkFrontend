import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigurationError } from '../core/api-contract';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.scss',
})
export class AuthPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly isRegistration = this.route.snapshot.data['mode'] === 'register';
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly registered = signal(false);
  protected readonly form = this.fb.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    confirmPassword: [''],
  });

  constructor() {
    const sessionError = this.route.snapshot.queryParamMap.get('sessionError');
    if (sessionError === 'configuration') {
      this.error.set('Die Backend-Verbindung ist noch nicht konfiguriert.');
    } else if (sessionError === 'unavailable') {
      this.error.set('Deine Sitzung konnte nicht geprüft werden. Bitte versuche es erneut.');
    }
    if (this.isRegistration) {
      this.form.controls.name.setValidators([Validators.required, Validators.maxLength(100)]);
      this.form.controls.password.setValidators([Validators.required]);
      this.form.controls.confirmPassword.setValidators([Validators.required]);
    }
  }

  submit(): void {
    this.error.set('');
    this.form.markAllAsTouched();
    if (this.form.invalid || (this.isRegistration && this.form.controls.password.value !== this.form.controls.confirmPassword.value)) {
      return;
    }

    this.busy.set(true);
    const { email, password, name } = this.form.getRawValue();
    const request: Observable<unknown> = this.isRegistration
      ? this.auth.register({ name: name ?? '', email: email ?? '', password: password ?? '' })
      : this.auth.login({ email: email ?? '', password: password ?? '' });

    request.subscribe({
      next: () => {
        this.busy.set(false);
        if (this.isRegistration) {
          this.registered.set(true);
          return;
        }
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
        this.router.navigateByUrl(returnUrl.startsWith('/') ? returnUrl : '/dashboard');
      },
      error: (error: unknown) => {
        this.busy.set(false);
        if (error instanceof ApiConfigurationError) {
          this.error.set('Die Backend-Verbindung ist noch nicht konfiguriert.');
        } else if (error instanceof HttpErrorResponse && error.status === 401) {
          this.error.set('E-Mail-Adresse oder Passwort sind nicht korrekt.');
        } else if (error instanceof HttpErrorResponse && error.status === 403) {
          this.error.set('Dein Konto hat noch keine Freigabe oder keine Berechtigung.');
        } else {
          this.error.set('Die Anfrage konnte nicht abgeschlossen werden. Bitte prüfe deine Eingaben und versuche es erneut.');
        }
      },
    });
  }

  passwordMismatch(): boolean {
    return this.isRegistration
      && this.form.controls.confirmPassword.touched
      && this.form.controls.password.value !== this.form.controls.confirmPassword.value;
  }
}
