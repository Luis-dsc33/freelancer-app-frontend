import { Component } from '@angular/core';
import { AdminLayoutComponent } from '../../components/admin-layout/admin-layout.component';
import { SeccionEnDesarrolloComponent, FiltroMaqueta } from '../../components/seccion-en-desarrollo/seccion-en-desarrollo.component';

// Cascarón de HU-27: estructura visual lista, lógica pendiente.
@Component({
  selector: 'app-bitacora',
  standalone: true,
  imports: [AdminLayoutComponent, SeccionEnDesarrolloComponent],
  templateUrl: './bitacora.page.html',
})
export class BitacoraPage {
  readonly columnas = ['Fecha', 'Administrador', 'Acción', 'Recurso', 'Motivo'];
  readonly filtros: FiltroMaqueta[] = [{ etiqueta: 'Administrador', tipo: 'opciones' }, { etiqueta: 'Tipo de acción', tipo: 'opciones', opciones: ['Suspender', 'Reactivar', 'Ocultar', 'Restaurar', 'Cerrar caso'] }, { etiqueta: 'Desde', tipo: 'fecha' }, { etiqueta: 'Hasta', tipo: 'fecha' }];
}
