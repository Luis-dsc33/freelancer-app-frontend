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
import { ObtenerMiPerfilHandler } from '../../usuarios/queries/obtener-mi-perfil.handler';
import { ObtenerMiPerfilQuery } from '../../usuarios/queries/obtener-mi-perfil.query';
import { FiltrosMarketplace, OportunidadProyecto } from '../models/oportunidad-proyecto';
import { ListarOportunidadesHandler } from '../queries/listar-oportunidades.handler';
import { ListarOportunidadesQuery } from '../queries/listar-oportunidades.query';

export interface OportunidadVista extends OportunidadProyecto {
  pagoEstimadoEstudiante: number | null;
  matching: ResultadoMatchingProyecto;
}

/**
 * ViewModel del marketplace (MVVM + CQRS).
 * Expone estado reactivo de oportunidades, filtros de búsqueda y matching por habilidades.
 */
@Injectable()
export class MarketplaceViewModel {
  private readonly listarOportunidades = inject(ListarOportunidadesHandler);
  private readonly obtenerMiPerfil = inject(ObtenerMiPerfilHandler, { optional: true });

  private readonly oportunidadesBase = signal<OportunidadProyecto[]>([]);
  readonly skillsEstudiante = signal<SkillEstudianteEntrada[]>([]);

  readonly busqueda = signal('');
  readonly disciplina = signal('');
  readonly modalidad = signal('');
  readonly presupuestoMin = signal<number | null>(null);
  readonly presupuestoMax = signal<number | null>(null);
  readonly soloUrgentes = signal(false);
  readonly habilidadFiltro = signal('');

  readonly cargando = signal(false);
  readonly error = signal('');

  readonly oportunidades = computed<OportunidadVista[]>(() => {
    const skills = this.skillsEstudiante();
    return this.oportunidadesBase().map(o => this.mapearVista(o, skills));
  });

  readonly total = computed(() => this.oportunidades().length);
  readonly urgentes = computed(() => this.oportunidades().filter(o => o.esUrgente).length);
  readonly hayFiltrosActivos = computed(() =>
    Boolean(
      this.busqueda().trim() ||
        this.disciplina().trim() ||
        this.modalidad().trim() ||
        this.presupuestoMin() !== null ||
        this.presupuestoMax() !== null ||
        this.soloUrgentes() ||
        this.habilidadFiltro().trim(),
    ),
  );

  cargar(): void {
    this.cargarSkillsEstudianteSiAplica();
    this.consultarOportunidades(this.construirFiltros());
  }

  aplicarFiltros(): void {
    this.consultarOportunidades(this.construirFiltros());
  }

  limpiarFiltros(): void {
    this.busqueda.set('');
    this.disciplina.set('');
    this.modalidad.set('');
    this.presupuestoMin.set(null);
    this.presupuestoMax.set(null);
    this.soloUrgentes.set(false);
    this.habilidadFiltro.set('');
    this.consultarOportunidades(undefined);
  }

  private consultarOportunidades(filtros?: FiltrosMarketplace): void {
    this.cargando.set(true);
    this.error.set('');

    this.listarOportunidades
      .execute(new ListarOportunidadesQuery(filtros))
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: items => this.oportunidadesBase.set(items),
        error: (err: HttpErrorResponse) => {
          this.oportunidadesBase.set([]);
          this.error.set(
            extraerMensajeErrorHttp(err, {
              mensajesEstado: {
                0: 'No pudimos conectar con el marketplace. Revisa tu conexión e inténtalo de nuevo.',
                401: 'Tu sesión venció. Inicia sesión nuevamente.',
                403: 'No tienes permiso para ver las oportunidades del marketplace.',
                404: 'El servicio de marketplace aún no está disponible.',
              },
              fallback: 'No se pudieron cargar las oportunidades. Inténtalo de nuevo.',
            }),
          );
        },
      });
  }

  private cargarSkillsEstudianteSiAplica(): void {
    if (!this.obtenerMiPerfil || leerSesionJwt()?.rol !== 'Estudiante') {
      return;
    }

    this.obtenerMiPerfil
      .execute(new ObtenerMiPerfilQuery())
      .pipe(catchError(() => of(null)))
      .subscribe(perfil => {
        if (!perfil) return;
        const desdeCatalogo: SkillEstudianteEntrada[] = (perfil.skillsCatalogo ?? []).map(s => ({
          skillId: s.skillId,
          nombreSkill: s.nombreSkill,
        }));
        const nombresCatalogo = new Set(desdeCatalogo.map(s => s.nombreSkill.trim().toLowerCase()));
        const legado: SkillEstudianteEntrada[] = (perfil.habilidades ?? [])
          .filter(h => !nombresCatalogo.has(h.trim().toLowerCase()))
          .map(nombre => ({ nombreSkill: nombre }));
        this.skillsEstudiante.set([...desdeCatalogo, ...legado]);
      });
  }

  private construirFiltros(): FiltrosMarketplace | undefined {
    const filtros: FiltrosMarketplace = {};
    if (this.busqueda().trim()) filtros.busqueda = this.busqueda().trim();
    if (this.disciplina().trim()) filtros.disciplina = this.disciplina().trim();
    if (this.modalidad().trim()) filtros.modalidad = this.modalidad().trim();
    if (this.presupuestoMin() !== null) filtros.presupuestoMin = this.presupuestoMin();
    if (this.presupuestoMax() !== null) filtros.presupuestoMax = this.presupuestoMax();
    if (this.soloUrgentes()) filtros.soloUrgentes = true;
    if (this.habilidadFiltro().trim()) filtros.habilidad = this.habilidadFiltro().trim();

    return Object.keys(filtros).length > 0 ? filtros : undefined;
  }

  private mapearVista(
    oportunidad: OportunidadProyecto,
    skillsEstudiante: readonly SkillEstudianteEntrada[],
  ): OportunidadVista {
    let pagoEstimadoEstudiante: number | null = null;
    try {
      pagoEstimadoEstudiante = calcularDesglosePago({
        presupuesto: oportunidad.presupuesto,
        esUrgente: oportunidad.esUrgente,
      }).pagoNetoEstudiante;
    } catch {
      pagoEstimadoEstudiante = null;
    }

    const matching = calcularMatchingProyecto(
      skillsEstudiante,
      oportunidad.skills ?? [],
      oportunidad.habilidadesRequeridas ?? [],
      oportunidad.habilidadesDeseables ?? [],
    );

    return {
      ...oportunidad,
      habilidadesRequeridas: oportunidad.habilidadesRequeridas ?? [],
      pagoEstimadoEstudiante,
      matching,
    };
  }
}
