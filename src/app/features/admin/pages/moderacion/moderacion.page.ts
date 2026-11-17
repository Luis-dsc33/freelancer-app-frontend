// ADMIN Marcos: HU-21 Moderar (suspender cuentas / ocultar ofertas) y HU-26 Revertir medidas.
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { refreshOutline, cloudOfflineOutline, fileTrayOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { AdminLayoutComponent } from '../../components/admin-layout/admin-layout.component';
import { MotivoDialogComponent } from '../../components/motivo-dialog/motivo-dialog.component';
import { AdministracionService } from '../../services/administracion.service';
import { Moderacion, TipoAccion } from '../../models/administracion';

interface MedidaPendiente { tipo: TipoAccion; id: string; nombre: string; }

@Component({
  selector: 'app-moderacion',
  standalone: true,
  imports: [AdminLayoutComponent, MotivoDialogComponent, DatePipe, CurrencyPipe, IonIcon, IonSpinner],
  templateUrl: './moderacion.page.html',
  styleUrls: ['./moderacion.page.scss'],
})
export class ModeracionPage {
  private readonly servicio = inject(AdministracionService);
  private readonly destroyRef = inject(DestroyRef);

  readonly pestana = signal<'cuentas' | 'ofertas'>('cuentas');
  readonly datos = signal<Moderacion | null>(null);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly exito = signal<string | null>(null);
  readonly ocultas = computed(() => this.datos()?.ofertas?.filter(o => o.oferta.estado === 'Oculta').length ?? 0);

  readonly medida = signal<MedidaPendiente | null>(null);
  readonly enviando = signal(false);
  readonly errorMedida = signal<string | null>(null);

  readonly textos: Record<TipoAccion, { titulo: string; descripcion: string; boton: string; exito: string }> = {
    Suspender: { titulo: 'Suspender cuenta', descripcion: 'no podrá iniciar sesión.', boton: 'Suspender', exito: 'Cuenta suspendida' },
    Reactivar: { titulo: 'Reactivar cuenta', descripcion: 'podrá volver a iniciar sesión.', boton: 'Reactivar', exito: 'Cuenta reactivada' },
    Ocultar: { titulo: 'Ocultar oferta', descripcion: 'dejará de verse en el tablero de ofertas.', boton: 'Ocultar', exito: 'Oferta oculta' },
    Restaurar: { titulo: 'Restaurar oferta', descripcion: 'volverá a verse en el tablero de ofertas.', boton: 'Restaurar', exito: 'Oferta restaurada' },
  };

  constructor() {
    addIcons({ refreshOutline, cloudOfflineOutline, fileTrayOutline, checkmarkCircleOutline });
  }

  ionViewWillEnter(): void { this.cargar(); }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.servicio.obtenerModeracion().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: d => { this.datos.set(d); this.cargando.set(false); },
      error: (e: HttpErrorResponse) => { this.error.set(this.servicio.mensajeDeError(e)); this.cargando.set(false); },
    });
  }

  abrir(tipo: TipoAccion, id: string, nombre: string): void {
    this.exito.set(null);
    this.errorMedida.set(null);
    this.medida.set({ tipo, id, nombre });
  }

  confirmar(motivo: string): void {
    const m = this.medida();
    if (!m) return;
    this.enviando.set(true);
    this.errorMedida.set(null);
    const peticiones = {
      Suspender: () => this.servicio.suspender(m.id, motivo),
      Reactivar: () => this.servicio.reactivar(m.id, motivo),
      Ocultar: () => this.servicio.ocultarOferta(m.id, motivo),
      Restaurar: () => this.servicio.restaurarOferta(m.id, motivo),
    };
    peticiones[m.tipo]().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.enviando.set(false);
        this.medida.set(null);
        this.exito.set(`${this.textos[m.tipo].exito}: ${m.nombre}.`);
        this.cargar();
      },
      error: (e: HttpErrorResponse) => { this.enviando.set(false); this.errorMedida.set(this.servicio.mensajeDeError(e)); },
    });
  }
}
