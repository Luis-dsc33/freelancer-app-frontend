import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { provideIonicAngular } from '@ionic/angular';
import { AppComponent } from './app.component';

describe('AppComponent (modo Capacitor)', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('tb-capacitor');
    document.body.classList.remove('tb-capacitor');
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideIonicAngular()],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.classList.remove('tb-capacitor');
    document.body.classList.remove('tb-capacitor');
  });

  it('no activa la clase tb-capacitor cuando corre en navegador web', () => {
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(false);
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(document.documentElement.classList.contains('tb-capacitor')).toBe(false);
  });

  it('activa la clase tb-capacitor únicamente cuando corre compilado en Capacitor', () => {
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(true);
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(document.documentElement.classList.contains('tb-capacitor')).toBe(true);
    expect(document.body.classList.contains('tb-capacitor')).toBe(true);
  });
});
