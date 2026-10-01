import { Observable } from 'rxjs';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline, linkOutline } from 'ionicons/icons';
import { PortafolioService } from '../../services/portafolio.service';

function requeridoSinEspacios(control: AbstractControl): ValidationErrors | null {
  return typeof control.value === 'string' && control.value.trim() ? null : { required: true };
}
function enlaceValido(control: AbstractControl): ValidationErrors | null {
  if (!control.value?.trim()) return null;
  try {
    const url = new URL(control.value.trim());
    return ['http:', 'https:'].includes(url.protocol) && url.hostname ? null : { enlace: true };
  } catch { return { enlace: true }; }
}

@Component({
  selector: 'app-trabajo-portafolio', standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IonContent, IonIcon, IonSpinner],
  templateUrl: './trabajo-portafolio.page.html', styleUrls: ['./trabajo-portafolio.page.scss'],
})
export class TrabajoPortafolioPage {
  readonly portafolio = inject(PortafolioService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly id = this.route.snapshot.paramMap.get('id');
  readonly formularioId = this.id ?? 'nuevo';
  readonly listo = signal(false);
  readonly form = inject(FormBuilder).nonNullable.group({
    titulo: ['', [requeridoSinEspacios, Validators.maxLength(150)]],
    descripcion: ['', [requeridoSinEspacios, Validators.maxLength(2000)]],
    enlace: ['', [enlaceValido, Validators.maxLength(2048)]],
  });

  constructor() { addIcons({ arrowBackOutline, linkOutline }); }

  ionViewWillEnter(): void {
    this.listo.set(false);
    this.portafolio.error.set('');
    this.portafolio.obtenerMiPortafolio().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: trabajos => {
        if (this.id) {
          const trabajo = trabajos.find(t => t.id === this.id);
          if (!trabajo) { this.portafolio.error.set('Este trabajo ya no está disponible en tu portafolio.'); return; }
          this.form.setValue({ titulo: trabajo.titulo, descripcion: trabajo.descripcion, enlace: trabajo.enlace ?? '' });
        }
        this.listo.set(true);
      }, error: () => undefined,
    });
  }

  guardar(): void {
    if (this.portafolio.guardando() || !this.listo()) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const valor = this.form.getRawValue();
    const datos = { titulo: valor.titulo.trim(), descripcion: valor.descripcion.trim(), enlace: valor.enlace.trim() || null };
    const peticion: Observable<unknown> = this.id ? this.portafolio.modificarTrabajo(this.id, datos) : this.portafolio.agregarTrabajo(datos);
    peticion.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.form.reset(); void this.router.navigate(['/portafolio']); },
      error: () => undefined,
    });
  }

  errorCampo(campo: 'titulo' | 'descripcion' | 'enlace'): string {
    const control = this.form.controls[campo];
    if (!control.touched) return '';
    if (control.hasError('required')) return campo === 'titulo' ? 'El título es obligatorio.' : 'La descripción es obligatoria.';
    if (control.hasError('maxlength')) return `Máximo ${control.errors?.['maxlength'].requiredLength} caracteres.`;
    return control.hasError('enlace') ? 'Escribe un enlace válido con http:// o https://.' : '';
  }
}
