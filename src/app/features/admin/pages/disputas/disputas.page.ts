import { Component } from '@angular/core';
import { AdminLayoutComponent } from '../../components/admin-layout/admin-layout.component';
import { SeccionEnDesarrolloComponent, FiltroMaqueta } from '../../components/seccion-en-desarrollo/seccion-en-desarrollo.component';

// Cascarón de HU-24: estructura visual lista, lógica pendiente.
@Component({
  selector: 'app-disputas',
  standalone: true,
  imports: [AdminLayoutComponent, SeccionEnDesarrolloComponent],
  templateUrl: './disputas.page.html',
})
export class DisputasPage {
  readonly columnas = ['Caso', 'Reportante', 'Contraparte', 'Oferta', 'Estado', 'Recibido'];
  readonly filtros: FiltroMaqueta[] = [{ etiqueta: 'Estado', tipo: 'opciones', opciones: ['Recibido', 'En revisión', 'Pendiente de información', 'Cerrado'] }, { etiqueta: 'Desde', tipo: 'fecha' }];
}
