import { Component, inject, signal, DestroyRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline, lockClosedOutline, eyeOutline, eyeOffOutline,
  checkmarkCircleOutline, timeOutline } from 'ionicons/icons';
import { RecuperacionService } from '../../services/recuperacion.service';

@Component({
  selector: 'app-restablecer-password', standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IonContent, IonIcon, IonSpinner],
  providers: [RecuperacionService],
  templateUrl: './restablecer-password.page.html',
  styleUrls: ['./restablecer-password.page.scss'],
})
export class RestablecerPasswordPage {
  readonly recuperacion = inject(RecuperacionService);
  readonly mostrarPassword = signal(false);
  readonly mostrarConfirmacion = signal(false);
  private token = '';
  readonly form = inject(FormBuilder).nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmarPassword: ['', Validators.required],
  }, { validators: control => control.get('password')?.value === control.get('confirmarPassword')?.value
    ? null : { noCoinciden: true } });

  constructor() {
    addIcons({ arrowBackOutline, lockClosedOutline, eyeOutline, eyeOffOutline,
      checkmarkCircleOutline, timeOutline });
    inject(ActivatedRoute).queryParamMap.pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(params => {
        this.token = params.get('token')?.trim() ?? '';
        this.form.reset();
        this.recuperacion.error.set('');
        this.recuperacion.estado.set(this.token ? 'formulario' : 'invalido');
      });
  }

  cambiar(): void {
    if (!this.token) { this.recuperacion.estado.set('invalido'); return; }
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.recuperacion.restablecerContrasena({ token: this.token, ...this.form.getRawValue() });
  }
}
