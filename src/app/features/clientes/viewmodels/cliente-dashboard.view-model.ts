import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../usuarios/services/auth.service';
import { ContratoCliente, OfertaCliente } from '../models/oferta-cliente';
import { OfertasClienteService } from '../services/ofertas-cliente.service';
import { mensajeErrorCliente } from '../utils/cliente-error';

@Injectable()
export class ClienteDashboardViewModel {
  private readonly servicio = inject(OfertasClienteService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly ofertas = signal<OfertaCliente[]>([]);
  readonly contratos = signal<ContratoCliente[]>([]);
  readonly cargandoOfertas = signal(true);
  readonly cargandoContratos = signal(true);
  readonly errorOfertas = signal('');
  readonly errorContratos = signal('');
  readonly ofertasAbiertas = computed(() => this.ofertas().filter(oferta => oferta.estado.toLowerCase() === 'abierto').length);
  readonly contratosActivos = computed(() => this.contratos().filter(contrato => contrato.estado.toLowerCase() === 'activo').length);

  cargar(): void {
    this.errorOfertas.set('');
    this.cargandoOfertas.set(true);
    this.servicio.listarMisOfertas().pipe(finalize(() => this.cargandoOfertas.set(false))).subscribe({
      next: ofertas => this.ofertas.set(ofertas),
      error: (err: HttpErrorResponse) => {
        this.errorOfertas.set(mensajeErrorCliente(err, 'cargar tus ofertas'));
        if (err.status === 401) this.expirarSesion();
      },
    });

    this.errorContratos.set('');
    this.cargandoContratos.set(true);
    this.servicio.listarMisContratos().pipe(finalize(() => this.cargandoContratos.set(false))).subscribe({
      next: contratos => this.contratos.set(contratos),
      error: (err: HttpErrorResponse) => {
        this.errorContratos.set(mensajeErrorCliente(err, 'cargar tus contratos'));
        if (err.status === 401) this.expirarSesion();
      },
    });
  }

  private expirarSesion(): void {
    this.auth.logout();
    void this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: '/cliente', sesion: 'expirada' },
    });
  }
}
