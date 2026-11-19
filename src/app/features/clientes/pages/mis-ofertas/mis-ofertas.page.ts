import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  briefcaseOutline,
  checkmarkOutline,
  closeOutline,
  createOutline,
  documentTextOutline,
  refreshOutline,
  trashOutline,
} from 'ionicons/icons';
import { ClienteLayoutComponent } from '../../components/cliente-layout/cliente-layout.component';
import { MisOfertasViewModel } from '../../viewmodels/mis-ofertas.view-model';

addIcons({
  alertCircleOutline,
  briefcaseOutline,
  checkmarkOutline,
  closeOutline,
  createOutline,
  documentTextOutline,
  refreshOutline,
  trashOutline,
});

@Component({
  selector: 'app-mis-ofertas',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, RouterLink, IonIcon, IonSpinner, ClienteLayoutComponent],
  templateUrl: './mis-ofertas.page.html',
  styleUrls: ['./mis-ofertas.page.scss'],
  providers: [MisOfertasViewModel],
})
export class MisOfertasPage implements OnInit {
  readonly vm = inject(MisOfertasViewModel);

  ngOnInit(): void {
    this.vm.cargar();
  }
}
