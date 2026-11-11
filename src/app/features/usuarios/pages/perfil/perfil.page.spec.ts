import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { PerfilService } from '../../services/perfil.service';
import { PerfilPage } from './perfil.page';

describe('PerfilPage', () => {
  let page: PerfilPage;
  let http: HttpTestingController;
  let router: Router;
  const perfilUrl = `${environment.gatewayUrl}/api/usuarios/Perfiles/mi-perfil`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    page = new PerfilPage(
      TestBed.inject(FormBuilder),
      TestBed.inject(PerfilService),
      router,
    );
    http = TestBed.inject(HttpTestingController);
    page.form.setValue({ carrera: 'Ingeniería', descripcion: 'Desarrolladora' });
    page.habilidades.set(['Angular']);
  });

  afterEach(() => http.verify());

  it('guarda el perfil y lleva al estudiante al marketplace', () => {
    page.guardar();

    const request = http.expectOne(perfilUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      carrera: 'Ingeniería',
      descripcion: 'Desarrolladora',
      habilidades: ['Angular'],
    });
    request.flush(null);

    expect(router.navigate).toHaveBeenCalledWith(['/marketplace']);
    expect(page.enviando()).toBe(false);
  });

  it('muestra errores de validación devueltos por la API', () => {
    page.guardar();
    http.expectOne(perfilUrl).flush(
      { errores: [{ campo: 'Carrera', mensaje: 'La carrera no es válida.' }] },
      { status: 400, statusText: 'Bad Request' },
    );

    expect(page.errorServidor()).toBe('La carrera no es válida.');
    expect(page.enviando()).toBe(false);
  });

  it('explica cuando la sesión venció', () => {
    page.guardar();
    http.expectOne(perfilUrl).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(page.errorServidor()).toBe('Tu sesión venció. Inicia sesión nuevamente.');
  });

  it('muestra el código HTTP cuando el servidor responde con un error genérico', () => {
    page.guardar();
    http.expectOne(perfilUrl).flush(
      { error: 'Ocurrió un error inesperado.' },
      { status: 500, statusText: 'Internal Server Error' },
    );

    expect(page.errorServidor()).toBe('El servidor devolvió un error al guardar el perfil. (HTTP 500)');
  });
});
