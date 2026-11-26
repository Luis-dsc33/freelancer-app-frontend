import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  chatbubbleEllipsesOutline,
  checkmarkCircleOutline,
  documentTextOutline,
  refreshOutline,
  star,
  starOutline,
  stopCircleOutline,
} from 'ionicons/icons';
import { ReputacionUsuarioComponent } from '../../../../shared/components/reputacion-usuario/reputacion-usuario.component';
import { ClienteLayoutComponent } from '../../components/cliente-layout/cliente-layout.component';
import { ContratoCliente } from '../../models/oferta-cliente';
import { ContratosViewModel } from '../../viewmodels/contratos.view-model';

addIcons({
  alertCircleOutline,
  chatbubbleEllipsesOutline,
  checkmarkCircleOutline,
  documentTextOutline,
  refreshOutline,
  star,
  starOutline,
  stopCircleOutline,
});

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [DatePipe, RouterLink, IonIcon, IonSpinner, ClienteLayoutComponent, ReputacionUsuarioComponent],
  templateUrl: './contratos.page.html',
  styleUrls: ['./contratos.page.scss'],
  providers: [ContratosViewModel],
})
export class ContratosPage implements OnInit {
  readonly vm = inject(ContratosViewModel);

  readonly estrellas = [1, 2, 3, 4, 5];
  readonly puntuacionSeleccionada = signal(5);
  readonly comentarioResena = signal('');

  ngOnInit(): void {
    this.vm.cargar();
  }

  abrirCalificacion(contrato: ContratoCliente): void {
    this.puntuacionSeleccionada.set(5);
    this.comentarioResena.set('');
    this.vm.abrirCalificacion(contrato);
  }

  enviarCalificacion(): void {
    this.vm.enviarCalificacion(this.puntuacionSeleccionada(), this.comentarioResena());
  }
}
