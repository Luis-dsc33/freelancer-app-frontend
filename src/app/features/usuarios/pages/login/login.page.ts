import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonHeader, IonToolbar, IonButtons, IonBackButton, IonIcon, IonSpinner, IonContent } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, alertCircleOutline, banOutline } from 'ionicons/icons';

addIcons({ mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, alertCircleOutline, banOutline });

type TipoErrorLogin = 'credenciales' | 'suspendida' | null;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonSpinner,
    IonContent,
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  form: FormGroup;

  enviando = signal(false);
  tipoError = signal<TipoErrorLogin>(null);
  formShake = signal(false);
  mostrarPassword = signal(false);

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  private dispararShake() {
    this.formShake.set(true);
    setTimeout(() => this.formShake.set(false), 400);
  }

  iniciarSesion() {
    this.tipoError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dispararShake();
      return;
    }

    this.enviando.set(true);
    const { email, password } = this.form.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.router.navigate(['/marketplace']); // ajusta a tu ruta post-login real
      },
      error: (err) => {
        this.enviando.set(false);
        // HU-02, Escenario 02-03: cuenta suspendida (backend responde 403)
        // HU-02, Escenario 02-02: credenciales incorrectas, mensaje genérico (no revela cuál campo)
        this.tipoError.set(err.status === 403 ? 'suspendida' : 'credenciales');
        this.dispararShake();
      },
    });
  }
}