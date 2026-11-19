import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  addOutline,
  alertCircleOutline,
  briefcaseOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  documentTextOutline,
  paperPlaneOutline,
  personOutline,
  refreshOutline,
  schoolOutline,
  searchOutline,
  sparklesOutline,
  star,
  starOutline,
  storefrontOutline,
} from 'ionicons/icons';
import { EstudianteNavComponent } from '../../../../shared/components/estudiante-nav/estudiante-nav.component';
import { GuardarMiPerfilHandler } from '../../commands/guardar-mi-perfil.handler';
import { PerfilEstudianteHttpRepository } from '../../data/perfil-estudiante-http.repository';
import { PERFIL_ESTUDIANTE_REPOSITORY } from '../../data/perfil-estudiante.repository';
import { NivelDominioSkill } from '../../models/perfil';
import { ListarCatalogoSkillsHandler } from '../../queries/listar-catalogo-skills.handler';
import { ObtenerMiPerfilHandler } from '../../queries/obtener-mi-perfil.handler';
import { ObtenerReputacionUsuarioHandler } from '../../queries/obtener-reputacion-usuario.handler';
import {
  NIVELES_DOMINIO,
  PerfilEstudianteViewModel,
} from '../../viewmodels/perfil-estudiante.view-model';

addIcons({
  addOutline,
  alertCircleOutline,
  briefcaseOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  documentTextOutline,
  paperPlaneOutline,
  personOutline,
  refreshOutline,
  schoolOutline,
  searchOutline,
  sparklesOutline,
  star,
  starOutline,
  storefrontOutline,
});

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonIcon,
    IonSpinner,
    EstudianteNavComponent,
  ],
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  providers: [
    PerfilEstudianteViewModel,
    ObtenerMiPerfilHandler,
    ListarCatalogoSkillsHandler,
    ObtenerReputacionUsuarioHandler,
    GuardarMiPerfilHandler,
    { provide: PERFIL_ESTUDIANTE_REPOSITORY, useClass: PerfilEstudianteHttpRepository },
  ],
})
export class PerfilPage {
  readonly vm = inject(PerfilEstudianteViewModel);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly nivelesDominio = NIVELES_DOMINIO;
  readonly habilidadManual = signal('');
  readonly errorValidacion = signal('');

  readonly form = this.fb.nonNullable.group({
    carrera: ['', [Validators.required, Validators.maxLength(150)]],
    descripcion: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  constructor() {
    effect(() => {
      const perfil = this.vm.perfil();
      if (!perfil) return;
      this.form.patchValue(
        {
          carrera: perfil.carrera ?? '',
          descripcion: perfil.descripcion ?? '',
        },
        { emitEvent: false },
      );
    });
  }

  ionViewWillEnter(): void {
    this.vm.cargar();
  }

  agregarHabilidadManual(): void {
    const valor = this.habilidadManual().trim();
    if (!valor) return;
    this.vm.agregarHabilidadLibre(valor);
    this.habilidadManual.set('');
    this.errorValidacion.set('');
  }

  actualizarNivel(skillId: string, evento: Event): void {
    const nivel = (evento.target as HTMLSelectElement).value as NivelDominioSkill;
    this.vm.cambiarNivelSkill(skillId, nivel);
  }

  guardar(): void {
    this.errorValidacion.set('');
    if (this.vm.guardando()) return;

    if (this.form.invalid || this.vm.totalHabilidades() === 0) {
      this.form.markAllAsTouched();
      if (this.vm.totalHabilidades() === 0) {
        this.errorValidacion.set('Selecciona o añade al menos una habilidad para habilitar el matching.');
      }
      return;
    }

    const eraIncompleto = !this.vm.esActualizacion() || !this.vm.esPerfilCompleto();
    const { carrera, descripcion } = this.form.getRawValue();

    this.vm
      .guardar(carrera, descripcion)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (eraIncompleto) {
            void this.router.navigate(['/marketplace']);
          }
        },
        error: () => undefined,
      });
  }

  etiquetaNivel(nivel: NivelDominioSkill): string {
    if (nivel === 'Basico') return 'Básico';
    return nivel;
  }
}
