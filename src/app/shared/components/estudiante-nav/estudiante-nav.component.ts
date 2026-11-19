import { Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  briefcaseOutline,
  chatbubbleEllipsesOutline,
  documentTextOutline,
  logOutOutline,
  paperPlaneOutline,
  personOutline,
  storefrontOutline,
} from 'ionicons/icons';
import { leerSesionJwt } from '../../../core/utils/sesion-jwt.util';
import { AuthService } from '../../../features/usuarios/services/auth.service';

addIcons({
  briefcaseOutline,
  chatbubbleEllipsesOutline,
  documentTextOutline,
  logOutOutline,
  paperPlaneOutline,
  personOutline,
  storefrontOutline,
});

interface NavItemEstudiante {
  ruta: string;
  etiqueta: string;
  icono: string;
  exact?: boolean;
}

const ITEMS_ESTUDIANTE: NavItemEstudiante[] = [
  { ruta: '/marketplace', etiqueta: 'Marketplace', icono: 'storefront-outline' },
  { ruta: '/auth/perfil', etiqueta: 'Mi perfil', icono: 'person-outline', exact: true },
  { ruta: '/portafolio', etiqueta: 'Portafolio', icono: 'briefcase-outline' },
  { ruta: '/estudiante/postulaciones', etiqueta: 'Postulaciones', icono: 'paper-plane-outline' },
  { ruta: '/estudiante/contratos', etiqueta: 'Contratos', icono: 'document-text-outline' },
  { ruta: '/estudiante/chat', etiqueta: 'Chat', icono: 'chatbubble-ellipses-outline' },
];

@Component({
  selector: 'app-estudiante-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IonIcon],
  templateUrl: './estudiante-nav.component.html',
  styleUrls: ['./estudiante-nav.component.scss'],
})
export class EstudianteNavComponent {
  private readonly authService = inject(AuthService, { optional: true });

  readonly soloBasico = input(false);

  readonly sesion = computed(() => leerSesionJwt());
  readonly esCliente = computed(() => this.sesion()?.rol === 'Cliente');
  readonly items = computed<NavItemEstudiante[]>(() => {
    if (this.soloBasico() || this.esCliente()) {
      return [ITEMS_ESTUDIANTE[0]];
    }
    return ITEMS_ESTUDIANTE;
  });

  cerrarSesion(): void {
    if (this.authService) {
      this.authService.logout();
      return;
    }
    try {
      localStorage.removeItem('jwt_token');
    } catch {
      // Ignorar entornos sin localStorage
    }
  }
}
