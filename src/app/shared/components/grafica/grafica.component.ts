import { Component, ElementRef, OnDestroy, afterRenderEffect, input, viewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);
Chart.defaults.font.family = 'Inter, sans-serif';
Chart.defaults.color = '#52514e';

// Envoltorio reutilizable de Chart.js: recibe la configuración y dibuja/redibuja el canvas.
@Component({
  selector: 'app-grafica',
  standalone: true,
  template: `<div class="grafica" [style.height.px]="alto()">
    <canvas #lienzo role="img" [attr.aria-label]="descripcion()"></canvas>
  </div>`,
  styles: [`.grafica { position: relative; width: 100%; }`],
})
export class GraficaComponent implements OnDestroy {
  readonly config = input.required<ChartConfiguration>();
  readonly descripcion = input('');
  readonly alto = input(260);

  private readonly lienzo = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');
  private grafica?: Chart;

  constructor() {
    afterRenderEffect(() => {
      const config = this.config();
      const lienzo = this.lienzo().nativeElement;
      // Espera a que cargue la fuente: si Chart.js mide con la fuente de respaldo, recorta etiquetas
      void document.fonts.ready.then(() => {
        this.grafica?.destroy();
        this.grafica = new Chart(lienzo, config);
      });
    });
  }

  ngOnDestroy(): void {
    this.grafica?.destroy();
  }
}
