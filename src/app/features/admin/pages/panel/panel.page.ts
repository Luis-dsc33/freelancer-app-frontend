import { Component, DestroyRef, computed, inject } from '@angular/core';
import { DecimalPipe, formatDate } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { refreshOutline, alertCircleOutline, cloudOfflineOutline, flaskOutline } from 'ionicons/icons';
import { ChartConfiguration } from 'chart.js';
import { MetricasService } from '../../services/metricas.service';
import { ConteoSemanal } from '../../models/metricas';
import { GraficaComponent } from '../../../../shared/components/grafica/grafica.component';
import { AdminLayoutComponent } from '../../components/admin-layout/admin-layout.component';

// Colores validados (contraste y daltonismo) para las series de las gráficas
const SERIE_1 = '#2a78d6'; // azul
const SERIE_2 = '#eb6834'; // naranja (serie única)
const REJILLA = '#ececea';

interface Etapa { etiqueta: string; total: number; porcentaje: number; }

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [DecimalPipe, IonIcon, IonSpinner, GraficaComponent, AdminLayoutComponent],
  templateUrl: './panel.page.html',
  styleUrls: ['./panel.page.scss'],
})
export class PanelPage {
  readonly servicio = inject(MetricasService);
  private readonly destroyRef = inject(DestroyRef);

  readonly m = this.servicio.metricas;

  readonly corte = computed(() => {
    const fecha = this.m()?.fechaCorte;
    return fecha ? `Corte: ${formatDate(fecha, 'dd/MM/yyyy, HH:mm', 'en-US')}` : null;
  });

  readonly casosAbiertos = computed(() => {
    const c = this.m()?.casos;
    return c ? c.recibidos + c.enRevision + c.pendientesInformacion : null;
  });

  // Embudo: cada etapa incluye a las siguientes (una postulación aceptada también fue revisada)
  readonly embudo = computed<Etapa[]>(() => {
    const p = this.m()?.marketplace?.postulaciones;
    if (!p) return [];
    const recibidas = p.enviadas + p.enRevision + p.aceptadas + p.noSeleccionadas;
    const etapas = [
      { etiqueta: 'Recibidas', total: recibidas },
      { etiqueta: 'Revisadas', total: p.enRevision + p.aceptadas + p.noSeleccionadas },
      { etiqueta: 'Con decisión', total: p.aceptadas + p.noSeleccionadas },
      { etiqueta: 'Aceptadas', total: p.aceptadas },
    ];
    return etapas.map(e => ({ ...e, porcentaje: recibidas ? Math.round((e.total / recibidas) * 100) : 0 }));
  });

  readonly casosPorEstado = computed(() => {
    const c = this.m()?.casos;
    if (!c) return [];
    const estados = [
      { etiqueta: 'Recibido', total: c.recibidos },
      { etiqueta: 'En revisión', total: c.enRevision },
      { etiqueta: 'Pendiente de información', total: c.pendientesInformacion },
      { etiqueta: 'Cerrado', total: c.cerrados },
    ];
    const max = Math.max(1, ...estados.map(e => e.total));
    return estados.map(e => ({ ...e, porcentaje: Math.round((e.total / max) * 100) }));
  });

  readonly graficaSemanal = computed<ChartConfiguration<'line'> | null>(() => {
    const u = this.m()?.usuarios?.registrosPorSemana;
    const o = this.m()?.marketplace?.ofertasPorSemana;
    const base = u ?? o;
    if (!base?.length) return null;

    const serie = (label: string, datos: ConteoSemanal[], color: string) => ({
      label, data: datos.map(d => d.total), borderColor: color, backgroundColor: color,
      borderWidth: 2, pointRadius: 4, pointHoverRadius: 6, tension: 0.25,
    });
    const datasets = [];
    if (u) datasets.push(serie('Registros de usuarios', u, SERIE_1));
    if (o) datasets.push(serie('Ofertas publicadas', o, SERIE_2));

    return {
      type: 'line',
      data: { labels: base.map(d => this.etiquetaSemana(d.inicioSemana)), datasets },
      options: {
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { color: REJILLA }, border: { display: false }, ticks: { precision: 0 } },
        },
      },
    };
  });

  readonly graficaDisciplinas = computed<ChartConfiguration<'bar'> | null>(() => {
    const datos = this.m()?.marketplace?.ofertasPorDisciplina;
    if (!datos?.length) return null;
    const ordenados = [...datos].sort((a, b) => b.total - a.total);
    return this.barras(ordenados.map(d => d.etiqueta), ordenados.map(d => d.total), 'Ofertas', 'y');
  });

  readonly graficaEstrellas = computed<ChartConfiguration<'bar'> | null>(() => {
    const datos = this.m()?.resenas?.distribucionEstrellas;
    if (!datos?.length) return null;
    return this.barras(datos.map(d => `${d.etiqueta} ★`), datos.map(d => d.total), 'Calificaciones', 'x');
  });

  constructor() {
    addIcons({ refreshOutline, alertCircleOutline, cloudOfflineOutline, flaskOutline });
  }

  ionViewWillEnter(): void { this.cargar(); }

  cargar(): void {
    this.servicio.obtenerMetricas().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ error: () => undefined });
  }

  private etiquetaSemana(fecha: string): string {
    return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  }

  private barras(labels: string[], data: number[], label: string, eje: 'x' | 'y'): ChartConfiguration<'bar'> {
    const ejeValor = eje === 'y' ? 'x' : 'y';
    return {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label, data, backgroundColor: SERIE_2, borderRadius: 4, borderSkipped: 'start', maxBarThickness: 26 }],
      },
      options: {
        indexAxis: eje,
        maintainAspectRatio: false,        plugins: { legend: { display: false } },
        scales: {
          [eje]: { grid: { display: false }, border: { display: false } },
          [ejeValor]: { beginAtZero: true, grid: { color: REJILLA }, border: { display: false }, ticks: { precision: 0 } },
        },
      },
    };
  }
}
