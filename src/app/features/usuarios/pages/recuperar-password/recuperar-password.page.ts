import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline, mailOutline, lockClosedOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { RecuperacionService } from '../../services/recuperacion.service';

@Component({
  selector: 'app-recuperar-password', standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IonContent, IonIcon, IonSpinner],
  providers: [RecuperacionService],
  templateUrl: './recuperar-password.page.html',
  styleUrls: ['./recuperar-password.page.scss'],
})
export class RecuperarPasswordPage {
  readonly recuperacion = inject(RecuperacionService);
  readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });
  constructor() { addIcons({ arrowBackOutline, mailOutline, lockClosedOutline, checkmarkCircleOutline }); }
  enviar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.recuperacion.solicitarRecuperacion({ email: this.form.getRawValue().email.trim() });
  }
}
