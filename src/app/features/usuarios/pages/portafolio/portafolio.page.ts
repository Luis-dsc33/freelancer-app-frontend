import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonContent, IonIcon, IonSpinner, IonModal } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, briefcaseOutline, createOutline, trashOutline, linkOutline, arrowBackOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { PortafolioService } from '../../services/portafolio.service';
import { TrabajoPortafolio } from '../../models/trabajo-portafolio';

@Component({
  selector: 'app-portafolio', standalone: true,
  imports: [RouterLink, IonContent, IonIcon, IonSpinner, IonModal],
  templateUrl: './portafolio.page.html', styleUrls: ['./portafolio.page.scss'],
})
export class PortafolioPage {
  readonly portafolio = inject(PortafolioService);
  private readonly destroyRef = inject(DestroyRef);
  readonly seleccionado = signal<TrabajoPortafolio | null>(null);

  constructor() {
    addIcons({ addOutline, briefcaseOutline, createOutline, trashOutline, linkOutline, arrowBackOutline, checkmarkCircleOutline });
  }

  ionViewWillEnter(): void { this.cargar(); }

  cargar(): void {
    this.portafolio.obtenerMiPortafolio().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ error: () => undefined });
  }

  confirmarEliminar(): void {
    const trabajo = this.seleccionado();
    if (!trabajo || this.portafolio.guardando()) return;
    this.portafolio.eliminarTrabajo(trabajo.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.seleccionado.set(null), error: () => this.seleccionado.set(null),
    });
  }

  cancelarEliminar(): void {
    if (!this.portafolio.guardando()) this.seleccionado.set(null);
  }

  cerrarModal = (): boolean => !this.portafolio.guardando();

  enlaceSeguro(enlace: string | null): string | null {
    if (!enlace) return null;
    try {
      const url = new URL(enlace);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  }

  nombreEnlace(enlace: string): string {
    try { return new URL(enlace).hostname; } catch { return 'Ver proyecto'; }
  }
}
