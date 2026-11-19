import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  checkmarkCircleOutline,
  documentTextOutline,
  refreshOutline,
  thumbsDownOutline,
  thumbsUpOutline,
} from 'ionicons/icons';
import { ClienteLayoutComponent } from '../../components/cliente-layout/cliente-layout.component';
import { PostulacionesViewModel } from '../../viewmodels/postulaciones.view-model';

addIcons({
  alertCircleOutline,
  checkmarkCircleOutline,
  documentTextOutline,
  refreshOutline,
  thumbsDownOutline,
  thumbsUpOutline,
});

@Component({
  selector: 'app-postulaciones',
  standalone: true,
  imports: [DatePipe, RouterLink, IonIcon, IonSpinner, ClienteLayoutComponent],
  templateUrl: './postulaciones.page.html',
  styleUrls: ['./postulaciones.page.scss'],
  providers: [PostulacionesViewModel],
})
export class PostulacionesPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly vm = inject(PostulacionesViewModel);
  readonly ofertaId = this.route.snapshot.paramMap.get('id') ?? '';

  ngOnInit(): void {
    if (this.ofertaId) this.vm.cargar(this.ofertaId);
  }
}
