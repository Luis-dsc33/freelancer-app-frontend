// ADMIN Marcos: HU-25 Consultar usuarios + HU-21 suspender / HU-26 reactivar cuentas.
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { searchOutline, timeOutline, closeOutline, fileTrayOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { AdminLayoutComponent } from '../../components/admin-layout/admin-layout.component';
import { MotivoDialogComponent } from '../../components/motivo-dialog/motivo-dialog.component';
import { AdministracionService } from '../../services/administracion.service';
import { AccionAdministrativa, PaginaUsuarios, UsuarioAdmin } from '../../models/administracion';

@Component({
  selector: 'app-usuarios-admin',
  standalone: true,
  imports: [AdminLayoutComponent, MotivoDialogComponent, DatePipe, FormsModule, IonIcon, IonSpinner],
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
})
export class UsuariosAdminPage {
  private readonly servicio = inject(AdministracionService);
  private readonly destroyRef = inject(DestroyRef);

  // Filtros
  busqueda = '';
  rol = '';
  estado = '';
  readonly pagina = signal(1);

  readonly resultado = signal<PaginaUsuarios | null>(null);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly exito = signal<string | null>(null);
  readonly totalPaginas = computed(() => {
    const r = this.resultado();
    return r ? Math.max(1, Math.ceil(r.total / r.tamanoPagina)) : 1;
  });
  readonly hayFiltros = computed(() => this.resultado() !== null && (!!this.busqueda || !!this.rol || !!this.estado));

  // Historial (HU-25-02)
  readonly seleccionado = signal<UsuarioAdmin | null>(null);
  readonly historial = signal<AccionAdministrativa[]>([]);
  readonly cargandoHistorial = signal(false);

  // Diálogo de medida
  readonly medida = signal<{ usuario: UsuarioAdmin; tipo: 'Suspender' | 'Reactivar' } | null>(null);
  readonly enviando = signal(false);
  readonly errorMedida = signal<string | null>(null);

  constructor() {
    addIcons({ searchOutline, timeOutline, closeOutline, fileTrayOutline, checkmarkCircleOutline });
  }

  ionViewWillEnter(): void { this.buscar(1); }

  buscar(pagina = 1): void {
    this.pagina.set(pagina);
    this.cargando.set(true);
    this.error.set(null);
    this.servicio.buscarUsuarios({ busqueda: this.busqueda.trim(), rol: this.rol, estado: this.estado, pagina })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: r => { this.resultado.set(r); this.cargando.set(false); },
        error: (e: HttpErrorResponse) => { this.error.set(this.servicio.mensajeDeError(e)); this.cargando.set(false); },
      });
  }

  limpiarFiltros(): void {
    this.busqueda = ''; this.rol = ''; this.estado = '';
    this.buscar(1);
  }

  verHistorial(usuario: UsuarioAdmin): void {
    this.seleccionado.set(usuario);
    this.cargandoHistorial.set(true);
    this.servicio.historialUsuario(usuario.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: h => { this.historial.set(h); this.cargandoHistorial.set(false); },
      error: () => { this.historial.set([]); this.cargandoHistorial.set(false); },
    });
  }

  abrirMedida(usuario: UsuarioAdmin): void {
    this.exito.set(null);
    this.errorMedida.set(null);
    this.medida.set({ usuario, tipo: usuario.estado === 'Suspendido' ? 'Reactivar' : 'Suspender' });
  }

  confirmarMedida(motivo: string): void {
    const m = this.medida();
    if (!m) return;
    this.enviando.set(true);
    this.errorMedida.set(null);
    const peticion = m.tipo === 'Suspender'
      ? this.servicio.suspender(m.usuario.id, motivo)
      : this.servicio.reactivar(m.usuario.id, motivo);

    peticion.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.enviando.set(false);
        this.medida.set(null);
        this.exito.set(`${m.tipo === 'Suspender' ? 'Cuenta suspendida' : 'Cuenta reactivada'}: ${m.usuario.nombre}.`);
        this.buscar(this.pagina());
        if (this.seleccionado()?.id === m.usuario.id) this.verHistorial(m.usuario);
      },
      // HU-21-04: si el servicio falla, la medida no se muestra como aplicada
      error: (e: HttpErrorResponse) => { this.enviando.set(false); this.errorMedida.set(this.servicio.mensajeDeError(e)); },
    });
  }
}
