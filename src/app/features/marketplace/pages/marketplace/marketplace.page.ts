import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  briefcaseOutline,
  flashOutline,
  peopleOutline,
  refreshOutline,
  storefrontOutline,
} from 'ionicons/icons';
import { MarketplaceViewModel } from '../../viewmodels/marketplace.view-model';
import { ListarOportunidadesHandler } from '../../queries/listar-oportunidades.handler';
import {
  OPORTUNIDAD_PROYECTO_REPOSITORY,
} from '../../data/oportunidad-proyecto.repository';
import { OportunidadProyectoHttpRepository } from '../../data/oportunidad-proyecto-http.repository';

addIcons({
  alertCircleOutline,
  briefcaseOutline,
  flashOutline,
  peopleOutline,
  refreshOutline,
  storefrontOutline,
});

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, IonContent, IonIcon, IonSpinner],
  templateUrl: './marketplace.page.html',
  styleUrls: ['./marketplace.page.scss'],
  providers: [
    MarketplaceViewModel,
    ListarOportunidadesHandler,
    { provide: OPORTUNIDAD_PROYECTO_REPOSITORY, useClass: OportunidadProyectoHttpRepository },
  ],
})
export class MarketplacePage {
  /** View del MVVM: solo enlaza UI al ViewModel. */
  readonly vm = inject(MarketplaceViewModel);

  ionViewWillEnter(): void {
    this.vm.cargar();
  }
}
