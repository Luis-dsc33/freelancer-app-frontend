import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { extraerMensajeErrorHttp } from '../../../core/utils/http-error.util';
import { ReputacionUsuario } from '../../../features/usuarios/models/reputacion';

/**
 * Muestra la reputación (promedio + reseñas recibidas) de cualquier usuario:
 * `GET /api/resenas/usuarios/{usuarioId}/reputacion`.
 *
 * - `abierto = true`: carga al instante (p. ej. en el perfil propio).
 * - `abierto = false`: muestra un botón y consulta bajo demanda (p. ej. en tarjetas de lista).
 */
@Component({
  selector: 'app-reputacion-usuario',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  template: `
    @if (!iniciado()) {
      <button type="button" class="rep-toggle" (click)="cargar()">
        ★ {{ etiqueta() }}
      </button>
    } @else {
      <section class="rep" [attr.aria-label]="etiqueta()">
        @if (cargando()) {
          <p class="rep-muted" role="status">Cargando reputación…</p>
        } @else if (error()) {
          <p class="rep-error" role="alert">{{ error() }}</p>
          <button type="button" class="rep-toggle" (click)="cargar()">Reintentar</button>
        } @else if (reputacion(); as rep) {
          <header class="rep-head">
            <strong class="rep-score">{{ rep.promedio | number: '1.1-2' }}</strong>
            <span class="rep-stars" aria-hidden="true">{{ estrellas(rep.promedio) }}</span>
            <span class="rep-muted">
              {{ rep.totalResenas }} {{ rep.totalResenas === 1 ? 'reseña' : 'reseñas' }}
            </span>
            @if (!abierto()) {
              <button type="button" class="rep-toggle rep-close" (click)="ocultar()">Ocultar</button>
            }
          </header>
          @if (rep.resenas.length === 0) {
            <p class="rep-muted">Aún no tiene reseñas.</p>
          } @else {
            <ul class="rep-list">
              @for (r of rep.resenas; track r.id) {
                <li>
                  <div class="rep-item-head">
                    <span class="rep-stars" aria-hidden="true">{{ estrellas(r.puntuacion) }}</span>
                    <span class="rep-muted">
                      {{ r.nombreAutor || 'Usuario TalentBridge' }} · {{ r.creadaEn | date: 'dd MMM yyyy' }}
                    </span>
                  </div>
                  <p>{{ r.comentario }}</p>
                </li>
              }
            </ul>
          }
        }
      </section>
    }
  `,
  styles: [
    `
      :host { display: block; }
      .rep { margin-top: 10px; padding: 12px 14px; border: 1px solid #2b2b2b; border-radius: 12px; background: #0e0e0e; }
      .rep-head { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
      .rep-score { color: #f5f5f5; font-size: 18px; }
      .rep-stars { color: #fb7f1b; letter-spacing: 1px; }
      .rep-muted { color: #999; font-size: 12px; margin: 0; }
      .rep-error { color: #fca5a5; font-size: 12px; margin: 0 0 6px; }
      .rep-list { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 10px; }
      .rep-list li { padding-top: 10px; border-top: 1px solid #222; }
      .rep-list p { margin: 4px 0 0; color: #ddd; font-size: 12px; line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; }
      .rep-item-head { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
      .rep-toggle { padding: 7px 12px; border: 1px solid #333; border-radius: 10px; background: transparent; color: #fb923c; font: 600 11px inherit; cursor: pointer; }
      .rep-toggle:hover { border-color: #fb7f1b; }
      .rep-close { margin-left: auto; }
    `,
  ],
})
export class ReputacionUsuarioComponent {
  private readonly http = inject(HttpClient);

  readonly usuarioId = input.required<string>();
  readonly etiqueta = input('Ver reputación');
  readonly abierto = input(false);

  readonly iniciado = signal(false);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly reputacion = signal<ReputacionUsuario | null>(null);

  private autocargaHecha = false;

  constructor() {
    queueMicrotask(() => {
      if (this.abierto() && !this.autocargaHecha) {
        this.cargar();
      }
    });
  }

  cargar(): void {
    const id = this.usuarioId();
    if (!id || this.cargando()) return;
    this.autocargaHecha = true;
    this.iniciado.set(true);
    this.cargando.set(true);
    this.error.set('');

    this.http
      .get<ReputacionUsuario>(
        `${environment.gatewayUrl}/api/resenas/usuarios/${encodeURIComponent(id)}/reputacion`,
      )
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: rep => this.reputacion.set(rep),
        error: (err: HttpErrorResponse) =>
          this.error.set(
            extraerMensajeErrorHttp(err, {
              mensajesEstado: { 404: 'El servicio de reseñas aún no está disponible.' },
              fallback: 'No se pudo cargar la reputación.',
            }),
          ),
      });
  }

  ocultar(): void {
    this.iniciado.set(false);
  }

  estrellas(valor: number): string {
    const llenas = Math.max(0, Math.min(5, Math.round(valor)));
    return '★'.repeat(llenas) + '☆'.repeat(5 - llenas);
  }
}
