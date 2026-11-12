import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { MetricasPanel } from '../models/metricas';

// ViewModel del panel (HU-28). Un método por Query del backend: ObtenerMetricasQuery.
@Injectable({ providedIn: 'root' })
export class MetricasService {
  private readonly http = inject(HttpClient);
  // /api/admin = prefijo del Gateway ------- /Metricas = ruta real del Controller en Admin.Api
  private readonly baseUrl = `${environment.gatewayUrl}/api/admin/Metricas`;

  readonly metricas = signal<MetricasPanel | null>(null);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  obtenerMetricas(): Observable<MetricasPanel> {
    this.cargando.set(true);
    this.error.set(null);
    return this.http.get<MetricasPanel>(this.baseUrl).pipe(
      tap({
        next: (m) => this.metricas.set(m),
        error: (err) => this.error.set(
          err.status === 401 || err.status === 403
            ? 'Tu sesión no tiene permisos de Administrador.'
            : 'No se pudo cargar el panel. Intenta de nuevo.'),
      }),
      finalize(() => this.cargando.set(false)),
    );
  }
}
