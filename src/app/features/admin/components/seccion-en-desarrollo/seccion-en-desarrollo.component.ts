import { Component, input, signal } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { searchOutline, fileTrayOutline } from 'ionicons/icons';

export interface FiltroMaqueta {
  etiqueta: string;
  tipo: 'texto' | 'opciones' | 'fecha';
  opciones?: string[];
}

// Cascarón visual de una sección del Administrador cuya lógica aún no está conectada.
// Muestra filtros, pestañas/estados y la tabla con sus columnas definitivas, sin datos.
@Component({
  selector: 'app-seccion-en-desarrollo',
  standalone: true,
  imports: [IonIcon],
  templateUrl: './seccion-en-desarrollo.component.html',
  styleUrls: ['./seccion-en-desarrollo.component.scss'],
})
export class SeccionEnDesarrolloComponent {
  readonly columnas = input.required<string[]>();
  readonly filtros = input<FiltroMaqueta[]>([]);
  readonly pestanas = input<string[]>([]);
  readonly estados = input<string[]>([]);
  readonly mensajeVacio = input('Aún no hay registros para mostrar.');

  readonly pestanaActiva = signal(0);

  constructor() {
    addIcons({ searchOutline, fileTrayOutline });
  }
}
