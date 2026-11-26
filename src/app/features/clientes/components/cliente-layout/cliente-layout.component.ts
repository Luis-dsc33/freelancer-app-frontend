import { Component, inject, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  chatbubbleEllipsesOutline,
  documentTextOutline,
  gridOutline,
  logOutOutline,
  peopleOutline,
  personCircleOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../usuarios/services/auth.service';

addIcons({ addCircleOutline, chatbubbleEllipsesOutline, documentTextOutline, gridOutline, logOutOutline, peopleOutline, personCircleOutline });

@Component({
  selector: 'app-cliente-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IonContent, IonIcon],
  templateUrl: './cliente-layout.component.html',
  styleUrls: ['./cliente-layout.component.scss'],
})
export class ClienteLayoutComponent {
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string>('');

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  get nombreUsuario(): string {
    return this.auth.currentUser?.nombre || 'Cliente';
  }

  cerrarSesion(): void {
    this.auth.logout();
    void this.router.navigate(['/auth/login']);
  }
}
