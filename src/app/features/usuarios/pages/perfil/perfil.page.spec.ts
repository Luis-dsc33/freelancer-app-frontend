import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { environment } from '../../../../../environments/environment';
import { PerfilPage } from './perfil.page';

describe('PerfilPage', () => {
  let page: PerfilPage;
  let http: HttpTestingController;
  let router: Router;
  const perfilUrl = `${environment.gatewayUrl}/api/usuarios/Perfiles/mi-perfil`;
  const categoriasUrl = `${environment.gatewayUrl}/api/marketplace/catalogo/habilidades/categorias`;
  const skillsUrl = `${environment.gatewayUrl}/api/marketplace/catalogo/habilidades`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideIonicAngular(),
      ],
    });
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    page = TestBed.createComponent(PerfilPage).componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('carga perfil y catálogo de habilidades al entrar a la vista', () => {
    page.ionViewWillEnter();

    http.expectOne(perfilUrl).flush({
      id: 'p1',
      usuarioId: 'u1',
      carrera: 'Ingeniería',
      descripcion: 'Desarrollador',
      habilidades: ['Angular'],
      skillsCatalogo: [],
      esPerfilCompleto: true,
    });
    http.expectOne(categoriasUrl).flush([{ id: 'c1', nombre: 'Frontend', activa: true }]);
    http.expectOne(skillsUrl).flush([
      { id: 's1', nombre: 'Angular', categoriaId: 'c1', categoriaNombre: 'Frontend', activa: true },
    ]);
    http.expectOne(`${environment.gatewayUrl}/api/resenas/usuarios/u1/reputacion`)
      .flush({ usuarioId: 'u1', promedio: 5, totalResenas: 1, resenas: [] });

    expect(page.vm.skillsSeleccionadas()).toHaveLength(1);
    expect(page.vm.skillsSeleccionadas()[0].skillId).toBe('s1');
  });

  it('guarda perfil nuevo con skills del catálogo y redirige al marketplace', () => {
    page.form.setValue({ carrera: 'Ingeniería', descripcion: 'Desarrolladora' });
    page.vm.agregarSkillCatalogo({
      id: 's1',
      nombre: 'Angular',
      categoriaId: 'c1',
      categoriaNombre: 'Frontend',
    }, 'Avanzado');

    page.guardar();

    const request = http.expectOne(perfilUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      carrera: 'Ingeniería',
      descripcion: 'Desarrolladora',
      habilidades: ['Angular'],
      skillsCatalogo: [{ skillId: 's1', nombreSkill: 'Angular', nivelDominio: 'Avanzado' }],
    });
    request.flush(null);

    expect(router.navigate).toHaveBeenCalledWith(['/marketplace']);
    expect(page.vm.guardando()).toBe(false);
  });

  it('muestra errores de validación devueltos por la API', () => {
    page.form.setValue({ carrera: 'Ingeniería', descripcion: 'Desarrolladora' });
    page.vm.agregarHabilidadLibre('Angular');

    page.guardar();
    http.expectOne(perfilUrl).flush(
      { errores: [{ campo: 'Carrera', mensaje: 'La carrera no es válida.' }] },
      { status: 400, statusText: 'Bad Request' },
    );

    expect(page.vm.error()).toBe('La carrera no es válida.');
    expect(page.vm.guardando()).toBe(false);
  });

  it('explica cuando la sesión venció', () => {
    page.form.setValue({ carrera: 'Ingeniería', descripcion: 'Desarrolladora' });
    page.vm.agregarHabilidadLibre('Angular');

    page.guardar();
    http.expectOne(perfilUrl).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(page.vm.error()).toBe('Tu sesión venció. Inicia sesión nuevamente.');
  });
});
