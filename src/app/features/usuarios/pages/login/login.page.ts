import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonHeader, IonToolbar, IonButtons, IonBackButton, IonIcon, IonSpinner, IonContent } from '@ionic/angular';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PerfilService } from '../../services/perfil.service';
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

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private route: ActivatedRoute, private perfilService: PerfilService) {
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
      next: (respuesta) => {
        const destino = this.route.snapshot.queryParamMap.get('returnUrl');
        const portafolio = destino && /^\/portafolio(?:\/|$)/.test(destino);

        if (respuesta.rol === 'Estudiante') {
          this.perfilService.getMiPerfil().subscribe({
            next: (perfil) => {
              this.enviando.set(false);
              if (perfil && perfil.esPerfilCompleto === false) {
                void this.router.navigate(['/auth/perfil']);
              } else {
                if (portafolio) void this.router.navigateByUrl(destino);
                else void this.router.navigate(['/portafolio']);
              }
            },
            error: (err) => {
              this.enviando.set(false);
              console.error('Error al obtener perfil', err);
              void this.router.navigate(['/auth/perfil']);
            }
          });
        } else {
          this.enviando.set(false);
          if (portafolio) void this.router.navigateByUrl(destino);
          else void this.router.navigate(['/marketplace']);
        }
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