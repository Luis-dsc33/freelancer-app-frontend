import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { PortafolioService } from './portafolio.service';
import { TrabajoPortafolio } from '../models/trabajo-portafolio';

describe('PortafolioService', () => {
  let service: PortafolioService;
  let http: HttpTestingController;
  const base = `${environment.gatewayUrl}/api/usuarios/Portafolios`;
  const trabajo: TrabajoPortafolio = { id: 'uno', titulo: 'Proyecto', descripcion: 'Descripción', enlace: null, creadoEn: '2026-09-30', actualizadoEn: null };
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(PortafolioService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('consulta trabajos por el gateway y actualiza el estado', () => {
    service.obtenerMiPortafolio().subscribe();
    expect(service.cargando()).toBe(true);
    http.expectOne(`${base}/mi-portafolio`).flush([trabajo]);
    expect(service.trabajos()).toEqual([trabajo]);
    expect(service.cargando()).toBe(false);
  });
  it('crea sin enviar IDs de propietario', () => {
    const datos = { titulo: 'Proyecto', descripcion: 'Descripción', enlace: null };
    service.agregarTrabajo(datos).subscribe();
    const req = http.expectOne(`${base}/trabajos`);
    expect(req.request.method).toBe('POST'); expect(req.request.body).toEqual(datos);
    req.flush({ id: 'uno' }, { status: 201, statusText: 'Created' });
    expect(service.guardando()).toBe(false); expect(service.mensaje()).toContain('agregado');
  });
  it('modifica por PUT y acepta 204', () => {
    service.modificarTrabajo('uno', { titulo: 'Nuevo', descripcion: 'Actualizado', enlace: null }).subscribe();
    const req = http.expectOne(`${base}/trabajos/uno`);
    expect(req.request.method).toBe('PUT'); req.flush(null, { status: 204, statusText: 'No Content' });
    expect(service.mensaje()).toContain('guardados');
  });
  it('elimina únicamente el registro confirmado al recibir 204', () => {
    service.trabajos.set([trabajo, { ...trabajo, id: 'dos' }]);
    service.eliminarTrabajo('uno').subscribe();
    expect(service.trabajos().length).toBe(2);
    const req = http.expectOne(`${base}/trabajos/uno`);
    expect(req.request.method).toBe('DELETE'); req.flush(null, { status: 204, statusText: 'No Content' });
    expect(service.trabajos().map(t => t.id)).toEqual(['dos']);
  });
  it('conserva el registro si falla la eliminación', () => {
    service.trabajos.set([trabajo]);
    service.eliminarTrabajo('uno').subscribe({ error: () => undefined });
    http.expectOne(`${base}/trabajos/uno`).flush({}, { status: 500, statusText: 'Error' });
    expect(service.trabajos()).toEqual([trabajo]); expect(service.guardando()).toBe(false);
  });
  it('muestra errores de validación del backend', () => {
    service.agregarTrabajo({ titulo: '', descripcion: 'Texto', enlace: null }).subscribe({ error: () => undefined });
    http.expectOne(`${base}/trabajos`).flush({ errores: [{ campo: 'Titulo', mensaje: 'El título es obligatorio.' }] }, { status: 400, statusText: 'Bad Request' });
    expect(service.error()).toBe('El título es obligatorio.');
  });
  it('explica la restricción para el rol Cliente', () => {
    service.obtenerMiPortafolio().subscribe({ error: () => undefined });
    http.expectOne(`${base}/mi-portafolio`).flush(null, { status: 403, statusText: 'Forbidden' });
    expect(service.sinPermiso()).toBe(true); expect(service.error()).toContain('estudiante');
  });
  it('permite reintentar después de un error de conexión', () => {
    service.obtenerMiPortafolio().subscribe({ error: () => undefined });
    http.expectOne(`${base}/mi-portafolio`).error(new ProgressEvent('error'));
    expect(service.error()).toContain('conectar'); expect(service.cargando()).toBe(false);
    service.obtenerMiPortafolio().subscribe();
    http.expectOne(`${base}/mi-portafolio`).flush([]);
    expect(service.error()).toBe('');
  });
});
