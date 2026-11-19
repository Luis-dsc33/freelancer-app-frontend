import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  checkmarkCircleOutline,
  documentTextOutline,
  refreshOutline,
  stopCircleOutline,
} from 'ionicons/icons';
import { ClienteLayoutComponent } from '../../components/cliente-layout/cliente-layout.component';
import { ContratosViewModel } from '../../viewmodels/contratos.view-model';

addIcons({
  alertCircleOutline,
  checkmarkCircleOutline,
  documentTextOutline,
  refreshOutline,
  stopCircleOutline,
});

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [DatePipe, RouterLink, IonIcon, IonSpinner, ClienteLayoutComponent],
  templateUrl: './contratos.page.html',
  styleUrls: ['./contratos.page.scss'],
  providers: [ContratosViewModel],
})
export class ContratosPage implements OnInit {
  readonly vm = inject(ContratosViewModel);

  ngOnInit(): void {
    this.vm.cargar();
  }
}
