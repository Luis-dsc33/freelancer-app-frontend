import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonModal, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  calendarOutline,
  chatbubbleEllipsesOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  documentTextOutline,
  refreshOutline,
  star,
  starOutline,
} from 'ionicons/icons';
import { EstudianteNavComponent } from '../../../../shared/components/estudiante-nav/estudiante-nav.component';
import { CalificarClienteHandler } from '../../commands/calificar-cliente.handler';
import { CancelarContratoHandler } from '../../commands/cancelar-contrato.handler';
import { FinalizarContratoHandler } from '../../commands/finalizar-contrato.handler';
import { ContratoHttpRepository } from '../../data/contrato-http.repository';
import { CONTRATO_REPOSITORY } from '../../data/contrato.repository';
import { ResenaHttpRepository } from '../../data/resena-http.repository';
import { RESENA_REPOSITORY } from '../../data/resena.repository';
import { EstadoContrato } from '../../models/contrato';
import { ListarMisContratosHandler } from '../../queries/listar-mis-contratos.handler';
import { ListarMisResenasEmitidasHandler } from '../../queries/listar-mis-resenas-emitidas.handler';
import {
  FiltroEstadoContrato,
  MisContratosViewModel,
} from '../../viewmodels/mis-contratos.view-model';

addIcons({
  alertCircleOutline,
  calendarOutline,
  chatbubbleEllipsesOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  documentTextOutline,
  refreshOutline,
  star,
  starOutline,
});

@Component({
  selector: 'app-mis-contratos',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    IonContent,
    IonIcon,
    IonModal,
    IonSpinner,
    EstudianteNavComponent,
  ],
  templateUrl: './mis-contratos.page.html',
  styleUrls: ['./mis-contratos.page.scss'],
  providers: [
    MisContratosViewModel,
    ListarMisContratosHandler,
    FinalizarContratoHandler,
    CancelarContratoHandler,
    CalificarClienteHandler,
    ListarMisResenasEmitidasHandler,
    { provide: CONTRATO_REPOSITORY, useClass: ContratoHttpRepository },
    { provide: RESENA_REPOSITORY, useClass: ResenaHttpRepository },
  ],
})
export class MisContratosPage {
  readonly vm = inject(MisContratosViewModel);
  readonly filtros: readonly FiltroEstadoContrato[] = [
    'Todos',
    'Activo',
    'Finalizado',
    'Cancelado',
  ];
  readonly estrellas = [1, 2, 3, 4, 5];

  readonly puntuacionSeleccionada = signal(5);
  readonly comentarioResena = signal('');

  ionViewWillEnter(): void {
    this.vm.cargar();
  }

  abrirCalificacion(contrato: Parameters<MisContratosViewModel['abrirModalResena']>[0]): void {
    this.puntuacionSeleccionada.set(5);
    this.comentarioResena.set('');
    this.vm.abrirModalResena(contrato);
  }

  enviarCalificacion(): void {
    this.vm.enviarResena(this.puntuacionSeleccionada(), this.comentarioResena());
  }

  cerrarModalAccion = (): boolean => !this.vm.procesandoId();
  cerrarModalResena = (): boolean => !this.vm.enviandoResena();

  claseEstado(estado: EstadoContrato): string {
    switch (estado) {
      case 'Activo':
        return 'active';
      case 'Finalizado':
        return 'finished';
      default:
        return 'cancelled';
    }
  }
}
