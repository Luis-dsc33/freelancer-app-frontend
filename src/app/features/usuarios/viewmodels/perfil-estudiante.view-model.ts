import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, finalize, of, tap } from 'rxjs';
import { extraerMensajeErrorHttp } from '../../../core/utils/http-error.util';
import { leerSesionJwt } from '../../../core/utils/sesion-jwt.util';
import { GuardarMiPerfilCommand } from '../commands/guardar-mi-perfil.command';
import { GuardarMiPerfilHandler } from '../commands/guardar-mi-perfil.handler';
import { CategoriaSkill, SkillCatalogo } from '../models/catalogo-skill';
import {
  EstudianteSkill,
  GuardarPerfilEstudiantePayload,
  NivelDominioSkill,
  PerfilEstudiante,
} from '../models/perfil';
import { ReputacionUsuario } from '../models/reputacion';
import { ListarCatalogoSkillsHandler } from '../queries/listar-catalogo-skills.handler';
import { ListarCatalogoSkillsQuery } from '../queries/listar-catalogo-skills.query';
import { ObtenerMiPerfilHandler } from '../queries/obtener-mi-perfil.handler';
import { ObtenerMiPerfilQuery } from '../queries/obtener-mi-perfil.query';
import { ObtenerReputacionUsuarioHandler } from '../queries/obtener-reputacion-usuario.handler';
import { ObtenerReputacionUsuarioQuery } from '../queries/obtener-reputacion-usuario.query';

export const NIVELES_DOMINIO: readonly NivelDominioSkill[] = ['Basico', 'Intermedio', 'Avanzado'];

/**
 * ViewModel del Perfil de Estudiante (MVVM + CQRS).
 * Coordina perfil, catálogo oficial de skills, reputación y persistencia.
 */
@Injectable()
export class PerfilEstudianteViewModel {
  private readonly obtenerPerfilHandler = inject(ObtenerMiPerfilHandler);
  private readonly listarCatalogoHandler = inject(ListarCatalogoSkillsHandler);
  private readonly obtenerReputacionHandler = inject(ObtenerReputacionUsuarioHandler);
  private readonly guardarPerfilHandler = inject(GuardarMiPerfilHandler);

  readonly perfil = signal<PerfilEstudiante | null>(null);
  readonly categorias = signal<CategoriaSkill[]>([]);
  readonly skillsCatalogo = signal<SkillCatalogo[]>([]);
  readonly categoriaSeleccionada = signal('');
  readonly busquedaSkill = signal('');
  readonly skillsSeleccionadas = signal<EstudianteSkill[]>([]);
  readonly habilidadesLibres = signal<string[]>([]);
  readonly reputacion = signal<ReputacionUsuario | null>(null);

  readonly cargando = signal(false);
  readonly cargandoCatalogo = signal(false);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly errorCatalogo = signal('');
  readonly mensajeExito = signal('');

  readonly esActualizacion = computed(() =>
    Boolean(this.perfil()?.id || this.perfil()?.usuarioId),
  );
  readonly esPerfilCompleto = computed(() => this.perfil()?.esPerfilCompleto ?? false);
  readonly camposFaltantes = computed(() => this.perfil()?.camposFaltantes ?? []);
  readonly totalHabilidades = computed(
    () => this.skillsSeleccionadas().length + this.habilidadesLibres().length,
  );
  readonly promedioCalificacion = computed(
    () => this.reputacion()?.promedio ?? this.perfil()?.calificacionPromedio ?? 0,
  );
  readonly totalResenas = computed(
    () => this.reputacion()?.totalResenas ?? this.perfil()?.totalResenas ?? 0,
  );

  readonly skillsDisponiblesFiltradas = computed(() => {
    const seleccionadas = new Set(
      this.skillsSeleccionadas().map(s => s.skillId.toLowerCase()),
    );
    const categoriaId = this.categoriaSeleccionada();
    const termino = this.busquedaSkill().trim().toLowerCase();

    return this.skillsCatalogo().filter(skill => {
      if (skill.activa === false) return false;
      if (seleccionadas.has(skill.id.toLowerCase())) return false;
      if (categoriaId && skill.categoriaId !== categoriaId) return false;
      if (termino && !skill.nombre.toLowerCase().includes(termino)) return false;
      return true;
    });
  });

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.mensajeExito.set('');

    this.obtenerPerfilHandler
      .execute(new ObtenerMiPerfilQuery())
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: data => {
          this.perfil.set(data);
          this.aplicarSkillsDePerfil(data);
          this.cargarReputacion(data.usuarioId ?? leerSesionJwt()?.usuarioId ?? null);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 404) {
            this.perfil.set(null);
            this.cargarReputacion(leerSesionJwt()?.usuarioId ?? null);
            return;
          }
          this.error.set(
            extraerMensajeErrorHttp(err, {
              mensajesEstado: {
                401: 'Tu sesión venció. Inicia sesión nuevamente.',
                403: 'Solo las cuentas de estudiante pueden editar este perfil.',
              },
              fallback: 'No se pudo cargar tu perfil de estudiante.',
            }),
          );
        },
      });

    this.cargarCatalogo();
  }

  cargarCatalogo(): void {
    this.cargandoCatalogo.set(true);
    this.errorCatalogo.set('');

    this.listarCatalogoHandler
      .execute(new ListarCatalogoSkillsQuery())
      .pipe(finalize(() => this.cargandoCatalogo.set(false)))
      .subscribe({
        next: ({ categorias, skills }) => {
          this.categorias.set(categorias.filter(c => c.activa !== false));
          this.skillsCatalogo.set(skills.filter(s => s.activa !== false));
          this.conciliarHabilidadesLegadoConCatalogo();
        },
        error: (err: HttpErrorResponse) => {
          this.errorCatalogo.set(
            extraerMensajeErrorHttp(err, {
              fallback: 'No se pudo cargar el catálogo oficial de habilidades. Puedes agregar etiquetas manuales.',
            }),
          );
        },
      });
  }

  seleccionarCategoria(categoriaId: string): void {
    this.categoriaSeleccionada.set(categoriaId);
  }

  actualizarBusquedaSkill(termino: string): void {
    this.busquedaSkill.set(termino);
  }

  agregarSkillCatalogo(skill: SkillCatalogo, nivelDominio: NivelDominioSkill = 'Intermedio'): void {
    const yaExiste = this.skillsSeleccionadas().some(
      s => s.skillId.toLowerCase() === skill.id.toLowerCase(),
    );
    if (yaExiste) return;

    this.skillsSeleccionadas.update(actual => [
      ...actual,
      {
        skillId: skill.id,
        nombreSkill: skill.nombre,
        categoria: skill.categoriaNombre,
        nivelDominio,
      },
    ]);
    this.habilidadesLibres.update(libres =>
      libres.filter(h => h.trim().toLowerCase() !== skill.nombre.trim().toLowerCase()),
    );
  }

  cambiarNivelSkill(skillId: string, nivelDominio: NivelDominioSkill): void {
    this.skillsSeleccionadas.update(actual =>
      actual.map(s => (s.skillId === skillId ? { ...s, nivelDominio } : s)),
    );
  }

  eliminarSkillCatalogo(skillId: string): void {
    this.skillsSeleccionadas.update(actual => actual.filter(s => s.skillId !== skillId));
  }

  agregarHabilidadLibre(nombreRaw: string): void {
    const nombre = nombreRaw.trim();
    if (!nombre) return;

    const coincidenciaCatalogo = this.skillsCatalogo().find(
      s => s.nombre.trim().toLowerCase() === nombre.toLowerCase(),
    );
    if (coincidenciaCatalogo) {
      this.agregarSkillCatalogo(coincidenciaCatalogo);
      return;
    }

    const existe = this.habilidadesLibres().some(
      h => h.trim().toLowerCase() === nombre.toLowerCase(),
    );
    const existeEnSeleccionadas = this.skillsSeleccionadas().some(
      s => s.nombreSkill.trim().toLowerCase() === nombre.toLowerCase(),
    );
    if (!existe && !existeEnSeleccionadas) {
      this.habilidadesLibres.update(actual => [...actual, nombre]);
    }
  }

  eliminarHabilidadLibre(nombre: string): void {
    this.habilidadesLibres.update(actual => actual.filter(item => item !== nombre));
  }

  guardar(carrera: string, descripcion: string): Observable<PerfilEstudiante | void> {
    this.error.set('');
    this.mensajeExito.set('');
    this.guardando.set(true);

    const nombresSkills = [
      ...this.skillsSeleccionadas().map(s => s.nombreSkill),
      ...this.habilidadesLibres(),
    ];
    const habilidadesUnicas = Array.from(new Set(nombresSkills.map(h => h.trim()).filter(Boolean)));

    const payload: GuardarPerfilEstudiantePayload = {
      carrera: carrera.trim(),
      descripcion: descripcion.trim(),
      habilidades: habilidadesUnicas,
      skillsCatalogo: this.skillsSeleccionadas().map(s => ({
        skillId: s.skillId,
        nombreSkill: s.nombreSkill,
        nivelDominio: s.nivelDominio,
      })),
    };

    const eraActualizacion = this.esActualizacion();
    return this.guardarPerfilHandler
      .execute(new GuardarMiPerfilCommand(payload, eraActualizacion))
      .pipe(
        tap(respuesta => {
          if (respuesta) {
            this.perfil.set(respuesta);
          } else {
            this.perfil.set({
              ...(this.perfil() ?? {}),
              ...payload,
              skillsCatalogo: this.skillsSeleccionadas(),
              esPerfilCompleto: true,
              camposFaltantes: [],
            });
          }
          this.mensajeExito.set('Perfil de estudiante guardado correctamente.');
        }),
        catchError((err: HttpErrorResponse) => {
          this.error.set(
            extraerMensajeErrorHttp(err, {
              mensajesEstado: {
                401: 'Tu sesión venció. Inicia sesión nuevamente.',
                403: 'No tienes permiso para completar este perfil.',
              },
              fallback: `El servidor devolvió un error al guardar el perfil. (HTTP ${err.status})`,
            }),
          );
          throw err;
        }),
        finalize(() => this.guardando.set(false)),
      );
  }

  private cargarReputacion(usuarioId: string | null): void {
    if (!usuarioId) return;
    this.obtenerReputacionHandler
      .execute(new ObtenerReputacionUsuarioQuery(usuarioId))
      .pipe(catchError(() => of(null)))
      .subscribe(rep => {
        if (rep) {
          this.reputacion.set(rep);
        }
      });
  }

  private aplicarSkillsDePerfil(data: PerfilEstudiante): void {
    if (data.skillsCatalogo && data.skillsCatalogo.length > 0) {
      this.skillsSeleccionadas.set(data.skillsCatalogo);
      const nombresCatalogo = new Set(
        data.skillsCatalogo.map(s => s.nombreSkill.trim().toLowerCase()),
      );
      this.habilidadesLibres.set(
        (data.habilidades ?? []).filter(h => !nombresCatalogo.has(h.trim().toLowerCase())),
      );
      return;
    }
    this.skillsSeleccionadas.set([]);
    this.habilidadesLibres.set(data.habilidades ?? []);
    this.conciliarHabilidadesLegadoConCatalogo();
  }

  private conciliarHabilidadesLegadoConCatalogo(): void {
    const catalogo = this.skillsCatalogo();
    const libres = this.habilidadesLibres();
    if (catalogo.length === 0 || libres.length === 0) return;

    const restantes: string[] = [];
    for (const hab of libres) {
      const match = catalogo.find(s => s.nombre.trim().toLowerCase() === hab.trim().toLowerCase());
      if (match) {
        this.agregarSkillCatalogo(match);
      } else {
        restantes.push(hab);
      }
    }
    this.habilidadesLibres.set(restantes);
  }
}
