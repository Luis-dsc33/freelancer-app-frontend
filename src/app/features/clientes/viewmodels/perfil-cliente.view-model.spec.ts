import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { PerfilClienteViewModel } from './perfil-cliente.view-model';

describe('PerfilClienteViewModel', () => {
  let vm: PerfilClienteViewModel;
  let http: HttpTestingController;
  const perfilUrl = `${environment.gatewayUrl}/api/clientes/mi-perfil`;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        PerfilClienteViewModel,
      ],
    });
    vm = TestBed.inject(PerfilClienteViewModel);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('crea el perfil cuando el cliente todavía no tiene uno', () => {
    vm.cargar();
    http.expectOne(perfilUrl).flush({}, { status: 404, statusText: 'Not Found' });
    vm.form.setValue({
      nombreEmpresa: 'CodeBridge Studio',
      telefono: '',
      ubicacion: '',
      descripcion: '',
      datosContacto: '',
    });

    vm.guardar();

    const request = http.expectOne(perfilUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.nombreEmpresa).toBe('CodeBridge Studio');
    request.flush(null, { status: 201, statusText: 'Created' });
    expect(vm.perfilExiste()).toBe(true);
    expect(vm.guardado()).toBe(true);
  });

  it('actualiza el perfil existente y no envía datos inválidos', () => {
    vm.cargar();
    http.expectOne(perfilUrl).flush({
      nombreEmpresa: 'CodeBridge',
      telefono: '4420000000',
      ubicacion: 'Querétaro',
      descripcion: 'Equipo de desarrollo',
      datosContacto: 'contacto@codebridge.test',
    });
    vm.guardar();

    const request = http.expectOne(perfilUrl);
    expect(request.request.method).toBe('PUT');
    request.flush(null);

    vm.form.controls.nombreEmpresa.setValue('   ');
    vm.guardar();
    expect(vm.form.controls.nombreEmpresa.invalid).toBe(true);
    http.expectNone(perfilUrl);
  });
});
