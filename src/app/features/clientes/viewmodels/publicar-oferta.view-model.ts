import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../usuarios/services/auth.service';
import {
  CampoOfertaCliente,
  OfertaCliente,
  PublicarOfertaRequest,
  SkillCatalogoCliente,
} from '../models/oferta-cliente';
import { OfertasClienteService } from '../services/ofertas-cliente.service';

type OfertaForm = FormGroup<{
  titulo: FormControl<string>;
  descripcion: FormControl<string>;
  disciplina: FormControl<string>;
  presupuesto: FormControl<number>;
  fechaLimite: FormControl<string>;
}>;

const CAMPOS_OFERTA: Record<string, CampoOfertaCliente> = {
  titulo: 'titulo',
  descripcion: 'descripcion',
  disciplina: 'disciplina',
  presupuesto: 'presupuesto',
  fechalimite: 'fechaLimite',
  habilidadesrequeridas: 'habilidadesRequeridas',
};

function fechaLocalIso(): string {
  const fecha = new Date();
  const zona = fecha.getTimezoneOffset() * 60_000;
  return new Date(fecha.getTime() - zona).toISOString().slice(0, 10);
}

function fechaNoPasada(hoy: string): ValidatorFn {
  return (control: AbstractControl<string>) => {
    const fecha = control.value;
    return fecha && fecha < hoy ? { fechaPasada: true } : null;
  };
}

@Injectable()
export class PublicarOfertaViewModel {
  private readonly servicio = inject(OfertasClienteService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly fechaMinima = fechaLocalIso();
  readonly form: OfertaForm = new FormGroup({
    titulo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
    descripcion: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
    disciplina: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
    presupuesto: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0.01)] }),
    fechaLimite: new FormControl('', { nonNullable: true, validators: [Validators.required, fechaNoPasada(this.fechaMinima)] }),
  });

  readonly guardando = signal(false);
  readonly ofertaPublicada = signal<OfertaCliente | null>(null);
  readonly error = signal('');
  readonly erroresCampos = signal<Partial<Record<CampoOfertaCliente, string[]>>>({});

  readonly catalogoSkills = signal<SkillCatalogoCliente[]>([]);
  readonly cargandoSkills = signal(false);
  readonly busquedaSkill = signal('');
  readonly skillsSeleccionadas = signal<string[]>([]);
  readonly skillsFiltradas = computed(() => {
    const catalogo = this.catalogoSkills();
    const seleccionadas = new Set(this.skillsSeleccionadas());
    const termino = this.busquedaSkill().trim().toLowerCase();
    const filtradas = termino
      ? catalogo.filter(skill =>
          skill.nombre.toLowerCase().includes(termino) ||
          (skill.categoriaNombre?.toLowerCase().includes(termino) ?? false))
      : catalogo;
    const elegidas = catalogo.filter(skill => seleccionadas.has(skill.id));
    const sugerencias = filtradas.filter(skill => !seleccionadas.has(skill.id)).slice(0, 20);
    return [...elegidas, ...sugerencias];
  });

  cargarCatalogoSkills(): void {
    if (this.cargandoSkills()) return;
    this.cargandoSkills.set(true);
    this.servicio.listarSkillsCatalogo().pipe(
      catchError(() => of<SkillCatalogoCliente[]>([])),
      finalize(() => this.cargandoSkills.set(false)),
    ).subscribe(skills => this.catalogoSkills.set(skills.filter(skill => skill.activo !== false)));
  }

  alternarSkill(skillId: string): void {
    this.skillsSeleccionadas.update(actuales => (
      actuales.includes(skillId)
        ? actuales.filter(id => id !== skillId)
        : [...actuales, skillId]
    ));
  }

  estaSeleccionada(skillId: string): boolean {
    return this.skillsSeleccionadas().includes(skillId);
  }

  publicar(): void {
    this.error.set('');
    this.erroresCampos.set({});

    if (this.guardando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const seleccionadas = this.skillsSeleccionadas();
    const primeraSkill = this.catalogoSkills()[0]?.id;
    const solicitud: PublicarOfertaRequest = {
      titulo: valores.titulo.trim(),
      descripcion: valores.descripcion.trim(),
      disciplina: valores.disciplina.trim(),
      presupuesto: valores.presupuesto,
      fechaLimite: valores.fechaLimite,
      habilidadesRequeridas: seleccionadas.length > 0
        ? seleccionadas
        : (primeraSkill ? [primeraSkill] : undefined),
    };

    this.guardando.set(true);
    this.servicio.publicarOferta(solicitud).pipe(
      finalize(() => this.guardando.set(false)),
    ).subscribe({
      next: oferta => this.ofertaPublicada.set(oferta),
      error: (err: HttpErrorResponse) => this.manejarError(err),
    });
  }

  nuevaOferta(): void {
    this.ofertaPublicada.set(null);
    this.error.set('');
    this.erroresCampos.set({});
    this.skillsSeleccionadas.set([]);
    this.busquedaSkill.set('');
    this.form.reset({ titulo: '', descripcion: '', disciplina: '', presupuesto: 0, fechaLimite: '' });
  }

  private manejarError(err: HttpErrorResponse): void {
    if (err.status === 0) {
      this.error.set('No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.');
      return;
    }
    if (err.status === 401) {
      this.auth.logout();
      void this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/cliente/publicar-oferta', sesion: 'expirada' },
      });
      return;
    }
    if (err.status === 403) {
      this.error.set('Tu cuenta no tiene permiso para publicar ofertas. Verifica que hayas iniciado sesión como Cliente.');
      return;
    }
    if (err.status === 400) {
      const errores = this.leerErroresCampos(err.error);
      this.erroresCampos.set(errores);
      this.error.set(this.detalleErrores(err.error) || this.leerMensaje(err.error) || (
        Object.keys(errores).length
          ? 'El servidor indicó los campos que debes corregir.'
          : 'El servidor rechazó la oferta. Revisa los datos e inténtalo de nuevo.'
      ));
      return;
    }

    this.error.set(this.leerMensaje(err.error) || 'No se pudo publicar la oferta. Inténtalo de nuevo.');
  }

  private leerErroresCampos(respuesta: unknown): Partial<Record<CampoOfertaCliente, string[]>> {
    const resultado: Partial<Record<CampoOfertaCliente, string[]>> = {};
    const body = this.comoRegistro(respuesta);
    if (!body) return resultado;

    const errores = this.comoRegistro(body['errors']);
    if (errores) {
      for (const [campo, mensajes] of Object.entries(errores)) {
        const campoOferta = CAMPOS_OFERTA[campo.toLowerCase()];
        const lista = Array.isArray(mensajes) ? mensajes : [mensajes];
        const textos = lista.filter((mensaje): mensaje is string => typeof mensaje === 'string');
        if (campoOferta && textos.length) resultado[campoOferta] = textos;
      }
    }

    const erroresLista = body['errores'];
    if (Array.isArray(erroresLista)) {
      for (const elemento of erroresLista) {
        const error = this.comoRegistro(elemento);
        if (!error || typeof error['campo'] !== 'string' || typeof error['mensaje'] !== 'string') continue;
        const campoOferta = CAMPOS_OFERTA[error['campo'].toLowerCase()];
        if (campoOferta) resultado[campoOferta] = [...(resultado[campoOferta] ?? []), error['mensaje']];
      }
    }

    return resultado;
  }

  /** Lista "campo: mensaje" con todos los errores de validación (400) que devuelve el backend. */
  private detalleErrores(respuesta: unknown): string {
    const body = this.comoRegistro(respuesta);
    if (!body) return '';
    const lineas: string[] = [];

    const errores = this.comoRegistro(body['errors']);
    if (errores) {
      for (const [campo, mensajes] of Object.entries(errores)) {
        const lista = Array.isArray(mensajes) ? mensajes : [mensajes];
        for (const m of lista) if (typeof m === 'string' && m.trim()) lineas.push(`${campo}: ${m}`);
      }
    }

    const erroresLista = body['errores'];
    if (Array.isArray(erroresLista)) {
      for (const elemento of erroresLista) {
        const error = this.comoRegistro(elemento);
        const mensaje = typeof error?.['mensaje'] === 'string' ? error['mensaje'].trim() : '';
        if (!mensaje) continue;
        const campo = typeof error?.['campo'] === 'string' ? error['campo'].trim() : '';
        lineas.push(campo ? `${campo}: ${mensaje}` : mensaje);
      }
    }

    return lineas.join(' | ');
  }

  private leerMensaje(respuesta: unknown): string {
    const body = this.comoRegistro(respuesta);
    if (!body) return '';
    for (const campo of ['detail', 'title', 'message', 'error']) {
      const valor = body[campo];
      if (typeof valor === 'string' && valor.trim()) return valor;
    }
    return '';
  }

  private comoRegistro(valor: unknown): Record<string, unknown> | null {
    return typeof valor === 'object' && valor !== null
      ? valor as Record<string, unknown>
      : null;
  }
}
