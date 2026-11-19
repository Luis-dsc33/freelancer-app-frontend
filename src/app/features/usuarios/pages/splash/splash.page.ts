import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowForwardOutline,
  rocketOutline,
  shieldCheckmarkOutline,
  sparklesOutline,
} from 'ionicons/icons';
import { leerSesionJwt } from '../../../../core/utils/sesion-jwt.util';

addIcons({
  arrowForwardOutline,
  rocketOutline,
  shieldCheckmarkOutline,
  sparklesOutline,
});

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [IonContent, IonIcon],
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage implements OnInit {
  private readonly router = inject(Router);

  ngOnInit(): void {
    const sesion = leerSesionJwt();
    if (sesion) {
      void this.router.navigate(
        [sesion.rol === 'Administrador' ? '/admin' : '/marketplace'],
        { replaceUrl: true },
      );
    }
  }

  comenzar(): void {
    void this.router.navigate(['/auth/login']);
  }
}
