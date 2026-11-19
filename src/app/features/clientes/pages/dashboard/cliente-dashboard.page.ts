import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowForwardOutline,
  briefcaseOutline,
  documentTextOutline,
  megaphoneOutline,
  personCircleOutline,
  peopleOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../usuarios/services/auth.service';
import { ClienteLayoutComponent } from '../../components/cliente-layout/cliente-layout.component';
import { ClienteDashboardViewModel } from '../../viewmodels/cliente-dashboard.view-model';

addIcons({
  arrowForwardOutline,
  briefcaseOutline,
  documentTextOutline,
  megaphoneOutline,
  personCircleOutline,
  peopleOutline,
});

@Component({
  selector: 'app-cliente-dashboard',
  standalone: true,
  imports: [RouterLink, IonIcon, IonSpinner, ClienteLayoutComponent],
  templateUrl: './cliente-dashboard.page.html',
  styleUrls: ['./cliente-dashboard.page.scss'],
  providers: [ClienteDashboardViewModel],
})
export class ClienteDashboardPage implements OnInit {
  private readonly auth = inject(AuthService);
  readonly vm = inject(ClienteDashboardViewModel);

  get nombreCliente(): string {
    return this.auth.currentUser?.nombre || 'Cliente';
  }

  ngOnInit(): void {
    this.vm.cargar();
  }
}
