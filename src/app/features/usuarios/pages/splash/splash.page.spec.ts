import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { SplashPage } from './splash.page';

describe('SplashPage', () => {
  let component: SplashPage;
  let fixture: ComponentFixture<SplashPage>;
  let router: Router;

  beforeEach(() => {
    localStorage.removeItem('jwt_token');
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideIonicAngular(),
      ],
    });
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(SplashPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('jwt_token');
  });

  it('should create when unauthenticated', () => {
    expect(component).toBeTruthy();
  });

  it('navigates to /auth/login when clicking Comencemos', () => {
    const comenzarSpy = vi.spyOn(component, 'comenzar');
    const boton = fixture.nativeElement.querySelector('.btn-comencemos') as HTMLButtonElement;

    expect(boton.textContent).toContain('Comencemos');
    boton.click();

    expect(comenzarSpy).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
