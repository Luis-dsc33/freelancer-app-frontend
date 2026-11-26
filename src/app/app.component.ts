import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { IonApp, IonRouterOutlet } from '@ionic/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  template: '<ion-app><ion-router-outlet /></ion-app>',
})
export class AppComponent implements OnInit {
  private readonly doc = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    this.doc.documentElement.classList.add('tb-capacitor');
    this.doc.body?.classList.add('tb-capacitor');
    void this.configurarBarraEstadoNativa();
    this.registrarFeedbackTactil();
  }

  private async configurarBarraEstadoNativa(): Promise<void> {
    try {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#090909' });
    } catch {
      // Ignorar en plataformas donde StatusBar no esté disponible.
    }
  }

  private registrarFeedbackTactil(): void {
    const handler = (ev: Event) => {
      const target = ev.target instanceof HTMLElement
        ? ev.target.closest('button, a.nav-item, a.tb-est-link, .filter-pill, .star-btn, .cliente-button, .primary, .secondary')
        : null;
      if (target && !target.hasAttribute('disabled')) {
        void Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
      }
    };

    this.doc.addEventListener('pointerdown', handler, { passive: true });
    this.destroyRef.onDestroy(() => this.doc.removeEventListener('pointerdown', handler));
  }
}
