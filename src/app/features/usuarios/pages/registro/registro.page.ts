import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import {
  schoolOutline,
  briefcaseOutline,
  personOutline,
  mailOutline,
  lockClosedOutline,
  checkmarkCircle,
  alertCircleOutline,
  closeOutline,
} from 'ionicons/icons';

addIcons({
  'school-outline': schoolOutline,
  'briefcase-outline': briefcaseOutline,
  'person-outline': personOutline,
  'mail-outline': mailOutline,
  'lock-closed-outline': lockClosedOutline,
  'checkmark-circle': checkmarkCircle,
  'alert-circle-outline': alertCircleOutline,
  'close-outline': closeOutline,
});

function passwordsCoincidenValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmar = control.get('confirmarPassword')?.value;
  return password && confirmar && password !== confirmar ? { noCoinciden: true } : null;
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule, RouterLink],
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage {
  form: FormGroup;

  enviando = signal(false);
  errorServidor = signal<string | null>(null);
  formShake = signal(false);
  mostrarPassword = signal(false);
  mostrarConfirmar = signal(false);
  mostrarExito = signal(false);

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group(
      {
        rol: ['Estudiante', Validators.required],
        nombre: ['', [Validators.required, Validators.maxLength(150)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmarPassword: ['', Validators.required],
      },
      { validators: passwordsCoincidenValidator }
    );
  }

  seleccionarRol(rol: 'Estudiante' | 'Cliente') {
    this.form.patchValue({ rol });
  }

  get fuerzaPassword(): 'debil' | 'media' | 'segura' {
    const p = this.form.get('password')?.value ?? '';
    if (p.length >= 10 && /[A-Z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p)) return 'segura';
    if (p.length >= 8) return 'media';
    return 'debil';
  }

  private dispararShake() {
    this.formShake.set(true);
    setTimeout(() => this.formShake.set(false), 400);
  }

  registrar() {
    this.errorServidor.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dispararShake();
      return;
    }

    this.enviando.set(true);
    const { rol, nombre, email, password } = this.form.value;

    this.authService.registrar({ nombre, email, password, rol }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.mostrarExito.set(true); 
      },
      error: (err) => {
        this.enviando.set(false);
        this.errorServidor.set(err.error?.error ?? 'Ocurrió un error inesperado. Intenta de nuevo.');
        this.dispararShake();
      },
    });
  }

  irALogin() {
    this.mostrarExito.set(false);
    this.router.navigate(['/auth/login']);
  }
}