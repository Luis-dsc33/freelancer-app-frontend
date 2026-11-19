import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, of } from 'rxjs';
import { extraerMensajeErrorHttp } from '../../../core/utils/http-error.util';
import {
  calcularMatchingProyecto,
  ResultadoMatchingProyecto,
  SkillEstudianteEntrada,
} from '../../../core/utils/matching-skills.util';
import { calcularDesglosePago } from '../../../core/utils/project-payout.util';
import { leerSesionJwt } from '../../../core/utils/sesion-jwt.util';
import { PostularAOfertaCommand } from '../../estudiante/commands/postular-a-oferta.command';
import { PostularAOfertaHandler } from '../../estudiante/commands/postular-a-oferta.handler';
import { ObtenerMiPerfilHandler } from '../../usuarios/queries/obtener-mi-perfil.handler';
import { ObtenerMiPerfilQuery } from '../../usuarios/queries/obtener-mi-perfil.query';
import { OportunidadProyecto } from '../models/oportunidad-proyecto';
import { ObtenerDetalleOportunidadHandler } from '../queries/obtener-detalle-oportunidad.handler';
import { ObtenerDetalleOportunidadQuery } from '../queries/obtener-detalle-oportunidad.query';

/**
 * ViewModel del Detalle de Oportunidad y envío de postulación (MVVM + CQRS).
 */
@Injectable()
export class DetalleOportunidadViewModel {
  private readonly obtenerDetalleHandler = inject(ObtenerDetalleOportunidadHandler);
  private readonly postularHandler = inject(PostularAOfertaHandler);
  private readonly obtenerMiPerfil = inject(ObtenerMiPerfilHandler, { optional: true });

  readonly oportunidad = signal<OportunidadProyecto | null>(null);
  readonly skillsEstudiante = signal<SkillEstudianteEntrada[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');

  readonly postulando = signal(false);
  readonly errorPostulacion = signal('');
  readonly postulacionExitosa = signal(false);

  readonly esEstudiante = computed(() => leerSesionJwt()?.rol === 'Estudiante');

  readonly pagoNetoEstimado = computed<number | null>(() => {
    const item = this.oportunidad();
    if (!item) return null;
    try {
      return calcularDesglosePago({
        presupuesto: item.presupuesto,
        esUrgente: item.esUrgente,
      }).pagoNetoEstudiante;
    } catch {
      return null;
    }
  });

  readonly matching = computed<ResultadoMatchingProyecto | null>(() => {
    const item = this.oportunidad();
    if (!item) return null;
    return calcularMatchingProyecto(
      this.skillsEstudiante(),
      item.skills ?? [],
      item.habilidadesRequeridas ?? [],
      item.habilidadesDeseables ?? [],
    );
  });

  cargar(id: string): void {
    if (!id) {
      this.error.set('Oportunidad no válida.');
      return;
    }

    this.cargando.set(true);
    this.error.set('');
    this.errorPostulacion.set('');
    this.postulacionExitosa.set(false);

    if (this.obtenerMiPerfil && leerSesionJwt()?.rol === 'Estudiante') {
      this.obtenerMiPerfil
        .execute(new ObtenerMiPerfilQuery())
        .pipe(catchError(() => of(null)))
        .subscribe(perfil => {
          if (!perfil) return;
          const desdeCatalogo: SkillEstudianteEntrada[] = (perfil.skillsCatalogo ?? []).map(s => ({
            skillId: s.skillId,
            nombreSkill: s.nombreSkill,
          }));
          const nombresCatalogo = new Set(
            desdeCatalogo.map(s => s.nombreSkill.trim().toLowerCase()),
          );
          const legado: SkillEstudianteEntrada[] = (perfil.habilidades ?? [])
            .filter(h => !nombresCatalogo.has(h.trim().toLowerCase()))
            .map(nombre => ({ nombreSkill: nombre }));
          this.skillsEstudiante.set([...desdeCatalogo, ...legado]);
        });
    }

    this.obtenerDetalleHandler
      .execute(new ObtenerDetalleOportunidadQuery(id))
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: detalle => this.oportunidad.set(detalle),
        error: (err: HttpErrorResponse) => {
          this.oportunidad.set(null);
          this.error.set(
            extraerMensajeErrorHttp(err, {
              mensajesEstado: {
                404: 'Esta oportunidad no existe o ya no está disponible para postulación.',
              },
              fallback: 'No se pudo cargar el detalle de la oportunidad.',
            }),
          );
        },
      });
  }

  postularse(mensaje: string): void {
    const oferta = this.oportunidad();
    if (!oferta || this.postulando() || oferta.yaPostulado) return;

    const texto = mensaje.trim();
    if (texto.length < 10) {
      this.errorPostulacion.set('Describe tu propuesta en al menos 10 caracteres.');
      return;
    }
    if (texto.length > 2000) {
      this.errorPostulacion.set('La propuesta no puede exceder los 2000 caracteres.');
      return;
    }

    this.postulando.set(true);
    this.errorPostulacion.set('');

    this.postularHandler
      .execute(new PostularAOfertaCommand(oferta.id, texto))
      .pipe(finalize(() => this.postulando.set(false)))
      .subscribe({
        next: () => {
          this.postulacionExitosa.set(true);
          this.oportunidad.update(actual => (actual ? { ...actual, yaPostulado: true } : actual));
        },
        error: (err: HttpErrorResponse) => {
          this.errorPostulacion.set(
            extraerMensajeErrorHttp(err, {
              mensajesEstado: {
                403: 'Solo las cuentas de estudiante pueden postularse a ofertas.',
                409: 'Ya te postulaste previamente a esta oportunidad.',
              },
              fallback: 'No se pudo enviar tu postulación. Inténtalo de nuevo.',
            }),
          );
        },
      });
  }
}
