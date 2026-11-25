import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { AuthPage } from './auth-page';

describe('registration page', () => {
  const register = vi.fn(() => of(void 0));

  beforeEach(async () => {
    register.mockClear();
    await TestBed.configureTestingModule({
      imports: [AuthPage],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: { mode: 'register' }, queryParamMap: { get: () => null } } } },
        { provide: Router, useValue: { navigateByUrl: vi.fn() } },
        { provide: AuthService, useValue: { register, login: vi.fn(() => of(null)) } },
      ],
    }).compileComponents();
  });

  it('rejects mismatched passwords without sending a registration request', () => {
    const fixture = TestBed.createComponent(AuthPage);
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    const values: Record<string, string> = {
      name: 'Alex Spieler',
      email: 'alex@example.test',
      password: 'passphrase',
      confirmPassword: 'different',
    };
    for (const [name, value] of Object.entries(values)) {
      const input = form.querySelector(`[formControlName="${name}"]`) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Die Passwörter stimmen nicht überein.');
  });

  it('shows the pending-approval confirmation after successful registration', () => {
    const fixture = TestBed.createComponent(AuthPage);
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    const values: Record<string, string> = {
      name: 'Alex Spieler',
      email: 'alex@example.test',
      password: 'passphrase',
      confirmPassword: 'passphrase',
    };
    for (const [name, value] of Object.entries(values)) {
      const input = form.querySelector(`[formControlName="${name}"]`) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(register).toHaveBeenCalledWith({ name: 'Alex Spieler', email: 'alex@example.test', password: 'passphrase' });
    expect(fixture.nativeElement.textContent).toContain('Deine Registrierung war erfolgreich.');
    expect(fixture.nativeElement.textContent).toContain('Konto muss noch von einem Administrator freigeschaltet werden.');
  });
});
