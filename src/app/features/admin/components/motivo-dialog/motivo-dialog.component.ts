// ADMIN Marcos: diálogo para confirmar una medida con motivo obligatorio (HU-21-03 / HU-26-03).
import { Component, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonSpinner } from '@ionic/angular';

@Component({
  selector: 'app-motivo-dialog',
  standalone: true,
  imports: [FormsModule, IonSpinner],
  template: `
    @if (abierto()) {
      <div class="fondo" (click)="cancelar.emit()">
        <div class="dialogo" role="dialog" aria-modal="true" [attr.aria-label]="titulo()" (click)="$event.stopPropagation()">
          <h2>{{ titulo() }}</h2>
          <p class="descripcion">{{ descripcion() }}</p>
          <label for="motivo">Motivo <span aria-hidden="true">*</span></label>
          <textarea id="motivo" rows="4" maxlength="500" [(ngModel)]="motivo"
                    placeholder="Explica por qué aplicas esta medida" [disabled]="enviando()"></textarea>
          <div class="pie-campo">
            @if (intentado() && !motivo.trim()) { <span class="error">El motivo es obligatorio.</span> } @else { <span></span> }
            <span>{{ motivo.length }}/500</span>
          </div>
          @if (error()) { <div class="aviso aviso--error">{{ error() }}</div> }
          <div class="botones">
            <button class="boton" (click)="cancelar.emit()" [disabled]="enviando()">Cancelar</button>
            <button class="boton" [class.boton--peligro]="peligro()" [class.boton--exito]="!peligro()"
                    (click)="enviar()" [disabled]="enviando()">
              @if (enviando()) { <ion-spinner name="crescent"></ion-spinner> }
              {{ textoConfirmar() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrls: ['./motivo-dialog.component.scss'],
})
export class MotivoDialogComponent {
  readonly abierto = input(false);
  readonly titulo = input('Confirmar medida');
  readonly descripcion = input('');
  readonly textoConfirmar = input('Confirmar');
  readonly peligro = input(true);
  readonly enviando = input(false);
  readonly error = input<string | null>(null);

  readonly confirmar = output<string>();
  readonly cancelar = output<void>();

  motivo = '';
  readonly intentado = signal(false);

  constructor() {
    // Cada vez que se abre, empieza limpio
    effect(() => {
      if (this.abierto()) { this.motivo = ''; this.intentado.set(false); }
    });
  }

  enviar(): void {
    this.intentado.set(true);
    if (this.motivo.trim()) this.confirmar.emit(this.motivo.trim());
  }
}
