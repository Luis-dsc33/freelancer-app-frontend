import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../usuarios/services/auth.service';
import { PerfilCliente } from '../models/oferta-cliente';
import { PerfilClienteService } from '../services/perfil-cliente.service';
import { mensajeErrorCliente } from '../utils/cliente-error';

type PerfilForm = FormGroup<{
  nombreEmpresa: FormControl<string>;
  telefono: FormControl<string>;
  ubicacion: FormControl<string>;
  descripcion: FormControl<string>;
  datosContacto: FormControl<string>;
}>;

@Injectable()
export class PerfilClienteViewModel {
  private readonly servicio = inject(PerfilClienteService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form: PerfilForm = new FormGroup({
    nombreEmpresa: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
    telefono: new FormControl('', { nonNullable: true }),
    ubicacion: new FormControl('', { nonNullable: true }),
    descripcion: new FormControl('', { nonNullable: true }),
    datosContacto: new FormControl('', { nonNullable: true }),
  });
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly perfilExiste = signal(false);
  readonly error = signal('');
  readonly guardado = signal(false);

  cargar(): void {
    this.error.set('');
    this.servicio.obtenerPerfil().pipe(
      finalize(() => this.cargando.set(false)),
    ).subscribe({
      next: perfil => {
        if (!perfil) return;
        this.form.patchValue(perfil);
        this.perfilExiste.set(true);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) return;
        this.error.set(mensajeErrorCliente(err, 'cargar el perfil'));
        if (err.status === 401) this.expirarSesion();
      },
    });
  }

  guardar(): void {
    this.error.set('');
    this.guardado.set(false);
    if (this.guardando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const perfil: PerfilCliente = this.form.getRawValue();
    const solicitud = this.perfilExiste()
      ? this.servicio.actualizarPerfil(perfil)
      : this.servicio.crearPerfil(perfil);

    this.guardando.set(true);
    solicitud.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: () => {
        this.perfilExiste.set(true);
        this.guardado.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeErrorCliente(err, 'guardar el perfil'));
        if (err.status === 401) this.expirarSesion();
      },
    });
  }

  private expirarSesion(): void {
    this.auth.logout();
    void this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: '/cliente/perfil', sesion: 'expirada' },
    });
  }
}
