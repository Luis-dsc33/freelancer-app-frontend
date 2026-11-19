import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { OfertasClienteService } from '../services/ofertas-cliente.service';
import { PublicarOfertaViewModel } from './publicar-oferta.view-model';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('PublicarOfertaViewModel', () => {
  let vm: PublicarOfertaViewModel;
  let http: HttpTestingController;
  const ofertaUrl = `${environment.gatewayUrl}/api/marketplace/proyectos`;
  const catalogoUrl = `${environment.gatewayUrl}/api/marketplace/catalogo/habilidades`;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        OfertasClienteService,
        PublicarOfertaViewModel,
      ],
    });
    vm = TestBed.inject(PublicarOfertaViewModel);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('no envía una oferta con presupuesto menor al mínimo o fecha anterior a hoy', () => {
    vm.form.setValue({
      titulo: 'Proyecto',
      descripcion: 'Descripción',
      disciplina: 'Desarrollo de software',
      presupuesto: 0,
      fechaLimite: '2020-01-01',
    });

    vm.publicar();

    expect(vm.form.controls.presupuesto.hasError('min')).toBe(true);
    expect(vm.form.controls.fechaLimite.hasError('fechaPasada')).toBe(true);
    http.expectNone(ofertaUrl);
  });

  it('envía el contrato completo de CrearOfertaRequest y publica cuando el backend crea en Borrador', () => {
    vm.cargarCatalogoSkills();
    http.expectOne(catalogoUrl).flush([
      { id: 'skill-1', nombre: 'Angular', activo: true },
    ]);
    vm.alternarSkill('skill-1');

    const solicitud = {
      titulo: 'Tienda en línea',
      descripcion: 'Crear una tienda para mi negocio.',
      disciplina: 'Desarrollo de software',
      presupuesto: 12000,
      fechaLimite: vm.fechaMinima,
    };
    vm.form.setValue(solicitud);

    vm.publicar();

    const request = http.expectOne(ofertaUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(expect.objectContaining({
      ...solicitud,
      moneda: 'MXN',
      tipoPresupuesto: 0,
      modalidad: 0,
      esquemaPago: 0,
      requierePortafolio: false,
      cantidadVacantes: 1,
      habilidadesRequeridas: ['skill-1'],
    }));
    request.flush({ id: 'oferta-1', ...solicitud, estado: 'Borrador' }, { status: 201, statusText: 'Created' });

    const publicarReq = http.expectOne(`${ofertaUrl}/oferta-1/publicar`);
    expect(publicarReq.request.method).toBe('PUT');
    publicarReq.flush({ id: 'oferta-1', ...solicitud, estado: 'Publicada' });

    expect(vm.ofertaPublicada()?.id).toBe('oferta-1');
    expect(vm.ofertaPublicada()?.estado).toBe('Publicada');
    expect(vm.guardando()).toBe(false);
  });

  it('asocia los errores 400 del backend a los campos que deben corregirse', () => {
    vm.form.setValue({
      titulo: 'Proyecto',
      descripcion: 'Descripción',
      disciplina: 'Desarrollo de software',
      presupuesto: 12000,
      fechaLimite: vm.fechaMinima,
    });
    vm.publicar();
    http.expectOne(ofertaUrl).flush(
      { errors: { Titulo: ['El título no es válido.'], fechaLimite: ['La fecha no está disponible.'] } },
      { status: 400, statusText: 'Bad Request' },
    );

    expect(vm.erroresCampos().titulo).toEqual(['El título no es válido.']);
    expect(vm.erroresCampos().fechaLimite).toEqual(['La fecha no está disponible.']);
    expect(vm.error()).toContain('El título no es válido.');
    expect(vm.error()).toContain('La fecha no está disponible.');
  });

  it('muestra errores explícitos para 403 y fallos de red', () => {
    vm.form.setValue({
      titulo: 'Proyecto',
      descripcion: 'Descripción',
      disciplina: 'Desarrollo de software',
      presupuesto: 12000,
      fechaLimite: vm.fechaMinima,
    });
    vm.publicar();
    http.expectOne(ofertaUrl).flush({}, { status: 403, statusText: 'Forbidden' });
    expect(vm.error()).toContain('permiso');

    vm.publicar();
    http.expectOne(ofertaUrl).error(new ProgressEvent('error'));
    expect(vm.error()).toContain('conectar');
  });
});
