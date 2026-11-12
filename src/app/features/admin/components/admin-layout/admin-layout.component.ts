import { Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  gridOutline, peopleOutline, shieldOutline, chatbubblesOutline, documentTextOutline, logOutOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../usuarios/services/auth.service';

// Estructura común de todas las páginas del rol Administrador: menú lateral + encabezado.
// Uso: <app-admin-layout titulo="..." subtitulo="..."> <div acciones>...</div> contenido </app-admin-layout>
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IonContent, IonIcon],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent {
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string | null>(null);

  private readonly auth = inject(AuthService);

  readonly menu = [
    { etiqueta: 'Panel', icono: 'grid-outline', ruta: '/admin/panel' },
    { etiqueta: 'Usuarios', icono: 'people-outline', ruta: '/admin/usuarios' },
    { etiqueta: 'Moderación', icono: 'shield-outline', ruta: '/admin/moderacion' },
    { etiqueta: 'Disputas', icono: 'chatbubbles-outline', ruta: '/admin/disputas' },
    { etiqueta: 'Bitácora', icono: 'document-text-outline', ruta: '/admin/bitacora' },
  ];

  constructor() {
    addIcons({ gridOutline, peopleOutline, shieldOutline, chatbubblesOutline, documentTextOutline, logOutOutline });
  }

  cerrarSesion(): void { this.auth.logout(); }
}
