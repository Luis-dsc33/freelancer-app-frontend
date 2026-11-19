import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { alertCircleOutline, checkmarkCircleOutline, megaphoneOutline } from 'ionicons/icons';
import { ClienteLayoutComponent } from '../../components/cliente-layout/cliente-layout.component';
import { OfertasClienteService } from '../../services/ofertas-cliente.service';
import { PublicarOfertaViewModel } from '../../viewmodels/publicar-oferta.view-model';

addIcons({ alertCircleOutline, checkmarkCircleOutline, megaphoneOutline });

@Component({
  selector: 'app-publicar-oferta',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, RouterLink, IonIcon, IonSpinner, ClienteLayoutComponent],
  templateUrl: './publicar-oferta.page.html',
  styleUrls: ['./publicar-oferta.page.scss'],
  providers: [PublicarOfertaViewModel, OfertasClienteService],
})
export class PublicarOfertaPage {
  readonly vm = inject(PublicarOfertaViewModel);
}
