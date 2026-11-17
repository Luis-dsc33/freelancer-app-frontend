// ADMIN Marcos: HU-27 Consultar la bitácora administrativa (solo lectura).
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { filterOutline, fileTrayOutline } from 'ionicons/icons';
import { AdminLayoutComponent } from '../../components/admin-layout/admin-layout.component';
import { AdministracionService } from '../../services/administracion.service';
import { Bitacora } from '../../models/administracion';

@Component({
  selector: 'app-bitacora',
  standalone: true,
  imports: [AdminLayoutComponent, DatePipe, FormsModule, IonIcon, IonSpinner],
  templateUrl: './bitacora.page.html',
  styleUrls: ['./bitacora.page.scss'],
})
export class BitacoraPage {
  private readonly servicio = inject(AdministracionService);
  private readonly destroyRef = inject(DestroyRef);

  adminId = '';
  tipoAccion = '';
  desde = '';
  hasta = '';

  readonly datos = signal<Bitacora | null>(null);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly errorRango = signal<string | null>(null);
  readonly totalPaginas = computed(() => {
    const d = this.datos();
    return d ? Math.max(1, Math.ceil(d.total / d.tamanoPagina)) : 1;
  });

  constructor() {
    addIcons({ filterOutline, fileTrayOutline });
  }

  ionViewWillEnter(): void { this.buscar(1); }

  buscar(pagina = 1): void {
    // HU-27-03: rango inválido → se señala y no se consulta
    if (this.desde && this.hasta && this.desde > this.hasta) {
      this.errorRango.set('La fecha inicial no puede ser posterior a la fecha final.');
      return;
    }
    this.errorRango.set(null);
    this.cargando.set(true);
    this.error.set(null);
    this.servicio.obtenerBitacora({
      adminId: this.adminId, tipoAccion: this.tipoAccion, desde: this.desde, hasta: this.hasta, pagina,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: d => { this.datos.set(d); this.cargando.set(false); },
      error: (e: HttpErrorResponse) => { this.error.set(this.servicio.mensajeDeError(e)); this.cargando.set(false); },
    });
  }

  limpiar(): void {
    this.adminId = ''; this.tipoAccion = ''; this.desde = ''; this.hasta = '';
    this.buscar(1);
  }
}
