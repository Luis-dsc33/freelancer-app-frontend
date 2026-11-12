import { Component } from '@angular/core';
import { AdminLayoutComponent } from '../../components/admin-layout/admin-layout.component';
import { SeccionEnDesarrolloComponent, FiltroMaqueta } from '../../components/seccion-en-desarrollo/seccion-en-desarrollo.component';

// Cascarón de HU-21 / HU-26: estructura visual lista, lógica pendiente.
@Component({
  selector: 'app-moderacion',
  standalone: true,
  imports: [AdminLayoutComponent, SeccionEnDesarrolloComponent],
  templateUrl: './moderacion.page.html',
})
export class ModeracionPage {
  readonly columnas = ['Recurso', 'Tipo', 'Motivo', 'Aplicada por', 'Fecha', 'Acción'];
  readonly filtros: FiltroMaqueta[] = [{ etiqueta: 'Buscar recurso', tipo: 'texto' }, { etiqueta: 'Tipo de contenido', tipo: 'opciones', opciones: ['Reseña', 'Oferta', 'Trabajo de portafolio'] }];
}
