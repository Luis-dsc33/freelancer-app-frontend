import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { alertCircleOutline, checkmarkCircleOutline, personCircleOutline } from 'ionicons/icons';
import { ClienteLayoutComponent } from '../../components/cliente-layout/cliente-layout.component';
import { leerSesionJwt } from '../../../../core/utils/sesion-jwt.util';
import { ReputacionUsuarioComponent } from '../../../../shared/components/reputacion-usuario/reputacion-usuario.component';
import { PerfilClienteViewModel } from '../../viewmodels/perfil-cliente.view-model';

addIcons({ alertCircleOutline, checkmarkCircleOutline, personCircleOutline });

@Component({
  selector: 'app-perfil-cliente',
  standalone: true,
  imports: [ReactiveFormsModule, IonIcon, IonSpinner, ClienteLayoutComponent, ReputacionUsuarioComponent],
  templateUrl: './perfil-cliente.page.html',
  styleUrls: ['./perfil-cliente.page.scss'],
  providers: [PerfilClienteViewModel],
})
export class PerfilClientePage implements OnInit {
  readonly vm = inject(PerfilClienteViewModel);
  readonly miUsuarioId = leerSesionJwt()?.usuarioId ?? null;

  ngOnInit(): void {
    this.vm.cargar();
  }
}
