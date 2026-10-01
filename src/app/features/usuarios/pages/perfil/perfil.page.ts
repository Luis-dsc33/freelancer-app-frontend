import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
        // Redirigir al inicio o dashboard luego de guardar el perfil
        this.router.navigate(['/']); 
      },
      error: (err) => {
        this.enviando.set(false);
        this.errorServidor.set(err.error?.error ?? err.message ?? 'Ocurrió un error inesperado al guardar el perfil.');
        this.dispararShake();
      }
    });
  }
}
