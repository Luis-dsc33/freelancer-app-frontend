import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { IonicModule } from '@ionic/angular/lazy';
import { Router } from '@angular/router';
import { PerfilService } from '../../services/perfil.service';
import { addIcons } from 'ionicons';
import { 
  schoolOutline, 
  starOutline, 
  documentTextOutline, 
  checkmarkCircle, 
  alertCircleOutline, 
  addOutline,
  closeCircleOutline 
} from 'ionicons/icons';

interface ErrorRespuestaPerfil {
  error?: string;
  message?: string;
  title?: string;
  detail?: string;
  errores?: { campo: string; mensaje: string }[];
  errors?: Record<string, string[]>;
}

addIcons({
  'school-outline': schoolOutline,
  'star-outline': starOutline,
  'document-text-outline': documentTextOutline,
  'checkmark-circle': checkmarkCircle,
  'alert-circle-outline': alertCircleOutline,
  'add-outline': addOutline,
  'close-circle-outline': closeCircleOutline
});

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  form: FormGroup;
  habilidades = signal<string[]>([]);
  habilidadInput = signal<string>('');
  
  enviando = signal(false);
  errorServidor = signal<string | null>(null);
  formShake = signal(false);

  constructor(
    private fb: FormBuilder, 
    private perfilService: PerfilService, 
    private router: Router
  ) {
    this.form = this.fb.group({
      carrera: ['', [Validators.required]],
      descripcion: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.cargarPerfil();
  }

  cargarPerfil() {
    this.perfilService.getMiPerfil().subscribe({
      next: (data) => {
        if (data && (data.id || data.usuarioId)) {
          this.form.patchValue({
            carrera: data.carrera || '',
            descripcion: data.descripcion || ''
          });
          this.habilidades.set(data.habilidades || []);
        }
      },
      error: (err) => {
        console.error('Error al cargar perfil', err);
      }
    });
  }

  agregarHabilidad() {
    const hab = this.habilidadInput().trim();
    if (hab && !this.habilidades().includes(hab)) {
      this.habilidades.update(h => [...h, hab]);
    }
    this.habilidadInput.set('');
  }
  
  eliminarHabilidad(hab: string) {
    this.habilidades.update(h => h.filter(item => item !== hab));
  }
  
  setHabilidadInput(event: any) {
    this.habilidadInput.set(event.target.value);
  }

  private dispararShake() {
    this.formShake.set(true);
    setTimeout(() => this.formShake.set(false), 400);
  }

  guardar() {
    this.errorServidor.set(null);
    if (this.form.invalid || this.habilidades().length === 0) {
      this.form.markAllAsTouched();
      this.dispararShake();
      if (this.habilidades().length === 0) {
        this.errorServidor.set('Añade al menos una habilidad.');
      }
      return;
    }

    this.enviando.set(true);
    const { carrera, descripcion } = this.form.value;
    
    const payload = {
      carrera: carrera.trim(),
      descripcion: descripcion.trim(),
      habilidades: this.habilidades()
    };

    this.perfilService.guardarPerfil(payload).subscribe({
      next: () => {
        this.enviando.set(false);
        void this.router.navigate(['/marketplace']);
      },
      error: (err: HttpErrorResponse) => {
        this.enviando.set(false);
        this.errorServidor.set(this.mensajeError(err));
        this.dispararShake();
      }
    });
  }

  private mensajeError(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
    }
    if (err.status === 401) {
      return 'Tu sesión venció. Inicia sesión nuevamente.';
    }
    if (err.status === 403) {
      return 'No tienes permiso para completar este perfil.';
    }

    const body = err.error && typeof err.error === 'object'
      ? err.error as ErrorRespuestaPerfil
      : null;
    const validaciones = body?.errores?.map(error => error.mensaje).join(' ')
      || Object.values(body?.errors ?? {}).flat().join(' ');
    const mensajeServidor = typeof err.error === 'string'
      ? err.error
      : body?.error || body?.detail || body?.message || body?.title;

    if (validaciones) return validaciones;
    if (mensajeServidor && !/ocurrió un error inesperado|unexpected error/i.test(mensajeServidor)) {
      return `${mensajeServidor} (HTTP ${err.status})`;
    }
    return `El servidor devolvió un error al guardar el perfil. (HTTP ${err.status})`;
  }
}
