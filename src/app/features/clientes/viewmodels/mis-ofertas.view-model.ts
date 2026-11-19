import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, finalize, map } from 'rxjs';
import { AuthService } from '../../usuarios/services/auth.service';
import { OfertaCliente, PublicarOfertaRequest } from '../models/oferta-cliente';
import { OfertasClienteService } from '../services/ofertas-cliente.service';
import { mensajeErrorCliente } from '../utils/cliente-error';

type ConfirmacionOferta = { id: string; accion: 'cerrar' | 'eliminar' } | null;
type OfertaForm = FormGroup<{
  titulo: FormControl<string>;
  descripcion: FormControl<string>;
  disciplina: FormControl<string>;
  presupuesto: FormControl<number>;
  fechaLimite: FormControl<string>;
}>;

@Injectable()
export class MisOfertasViewModel {
  private readonly servicio = inject(OfertasClienteService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly ofertas = signal<OfertaCliente[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly accionId = signal('');
  readonly error = signal('');
  readonly mensaje = signal('');
  readonly edicionId = signal('');
  readonly confirmacion = signal<ConfirmacionOferta>(null);
  private habilidadesEdicion: string[] = [];
  readonly form: OfertaForm = new FormGroup({
    titulo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
    descripcion: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
    disciplina: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
    presupuesto: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0.01)] }),
    fechaLimite: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.servicio.listarMisOfertas().pipe(
      finalize(() => this.cargando.set(false)),
    ).subscribe({
      next: ofertas => this.ofertas.set(ofertas),
      error: (err: HttpErrorResponse) => {
        this.ofertas.set([]);
        this.error.set(mensajeErrorCliente(err, 'cargar tus ofertas'));
        if (err.status === 401) this.expirarSesion();
      },
    });
  }

  esEditable(oferta: OfertaCliente): boolean {
    return ['abierto', 'abierta', 'publicada', 'publicado', 'borrador'].includes(oferta.estado.toLowerCase());
  }

  esBorrador(oferta: OfertaCliente): boolean {
    return oferta.estado.toLowerCase() === 'borrador';
  }

  publicarBorrador(id: string): void {
    if (this.guardando()) return;
    this.ejecutarAccion(
      id,
      'publicar la oferta',
      () => this.servicio.publicarOfertaExistente(id).pipe(map(() => void 0)),
      'La oferta se publicó correctamente.',
    );
  }

  editar(oferta: OfertaCliente): void {
    this.error.set('');
    this.mensaje.set('');
    this.edicionId.set(oferta.id);
    const desdeSkills = oferta.skills
      ?.filter(s => s.tipoRequisito === 'Requerida')
      .map(s => s.skillId)
      .filter(Boolean);
    const desdeHabilidades = oferta.habilidades
      ?.filter(h => h.tipoRequisito === 'Requerida')
      .map(h => h.skillId)
      .filter(Boolean);
    const existentes = desdeSkills?.length ? desdeSkills : desdeHabilidades;
    this.habilidadesEdicion = existentes?.length ? existentes : [];
    this.form.setValue({
      titulo: oferta.titulo,
      descripcion: oferta.descripcion,
      disciplina: oferta.disciplina,
      presupuesto: oferta.presupuesto,
      fechaLimite: oferta.fechaLimite.slice(0, 10),
    });
  }

  cancelarEdicion(): void {
    this.edicionId.set('');
    this.habilidadesEdicion = [];
    this.form.reset({ titulo: '', descripcion: '', disciplina: '', presupuesto: 0, fechaLimite: '' });
  }

  guardarEdicion(): void {
    const id = this.edicionId();
    if (!id || this.guardando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const datos: PublicarOfertaRequest = {
      titulo: values.titulo.trim(),
      descripcion: values.descripcion.trim(),
      disciplina: values.disciplina.trim(),
      presupuesto: values.presupuesto,
      fechaLimite: values.fechaLimite,
      ...(this.habilidadesEdicion.length ? { habilidadesRequeridas: this.habilidadesEdicion } : {}),
    };

    this.ejecutarAccion(id, 'actualizar la oferta', () =>
      this.servicio.actualizarOferta(id, datos),
      'Cambios guardados.',
    );
  }

  pedirConfirmacion(id: string, accion: 'cerrar' | 'eliminar'): void {
    this.error.set('');
    this.confirmacion.set({ id, accion });
  }

  cancelarConfirmacion(): void {
    this.confirmacion.set(null);
  }

  confirmarAccion(): void {
    const confirmacion = this.confirmacion();
    if (!confirmacion || this.guardando()) return;
    this.confirmacion.set(null);
    const accion = confirmacion.accion;
    const solicitud = accion === 'cerrar'
      ? () => this.servicio.cerrarOferta(confirmacion.id)
      : () => this.servicio.eliminarOferta(confirmacion.id);

    this.ejecutarAccion(
      confirmacion.id,
      accion === 'cerrar' ? 'cerrar la oferta' : 'eliminar la oferta',
      solicitud,
      accion === 'cerrar' ? 'La oferta se cerró correctamente.' : 'La oferta se eliminó correctamente.',
    );
  }

  private ejecutarAccion(id: string, accion: string, solicitud: () => Observable<void>, exito: string): void {
    this.error.set('');
    this.mensaje.set('');
    this.accionId.set(id);
    this.guardando.set(true);
    solicitud().pipe(finalize(() => {
      this.accionId.set('');
      this.guardando.set(false);
    })).subscribe({
      next: () => {
        this.cancelarEdicion();
        this.mensaje.set(exito);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeErrorCliente(err, accion));
        if (err.status === 401) this.expirarSesion();
      },
    });
  }

  private expirarSesion(): void {
    this.auth.logout();
    void this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: '/cliente/ofertas', sesion: 'expirada' },
    });
  }
}
