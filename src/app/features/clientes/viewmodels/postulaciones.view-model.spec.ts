import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { PostulacionesViewModel } from './postulaciones.view-model';

describe('PostulacionesViewModel (creación de contrato)', () => {
  let vm: PostulacionesViewModel;
  let http: HttpTestingController;

  const ofertaId = 'oferta-1';
  const postulacionAceptada = {
    id: 'post-1',
    proyectoId: ofertaId,
    estudianteId: 'est-1',
    estado: 'Aceptada',
    mensaje: 'Me interesa colaborar',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PostulacionesViewModel,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    vm = TestBed.inject(PostulacionesViewModel);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('precarga importeAcordado y fechaCompromiso desde la oferta y envía POST /api/marketplace/contratos con los 4 campos requeridos', () => {
    vm.cargar(ofertaId);

    http.expectOne(`${environment.gatewayUrl}/api/marketplace/proyectos/${ofertaId}`).flush({
      id: ofertaId,
      titulo: 'Landing page',
      descripcion: 'Desc',
      disciplina: 'Desarrollo web',
      presupuesto: 4500,
      fechaLimite: '2026-12-20',
      estado: 'Publicada',
    });

    http
      .expectOne(`${environment.gatewayUrl}/api/marketplace/ofertas/${ofertaId}/postulaciones`)
      .flush([postulacionAceptada]);

    vm.abrirFormularioContrato(postulacionAceptada);
    expect(vm.importeAcordado()).toBe(4500);
    expect(vm.fechaCompromiso()).toBe('2026-12-20');

    vm.crearContrato(postulacionAceptada);

    const req = http.expectOne(`${environment.gatewayUrl}/api/marketplace/contratos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      postulacionId: 'post-1',
      importeAcordado: 4500,
      fechaInicio: vm.fechaInicio(),
      fechaCompromiso: '2026-12-20',
    });

    req.flush({
      id: 'contrato-1',
      postulacionId: 'post-1',
      proyectoId: ofertaId,
      estudianteId: 'est-1',
      importeAcordado: 4500,
      fechaInicio: vm.fechaInicio(),
      fechaCompromiso: '2026-12-20',
      estado: 'Activo',
    });

    expect(vm.contratoCreado()).toBe(true);
    expect(vm.postulacionAContratar()).toBeNull();
  });

  it('valida que importeAcordado sea mayor que 0 y que fechaCompromiso >= fechaInicio', () => {
    vm.abrirFormularioContrato(postulacionAceptada);

    vm.actualizarImporte(0);
    vm.crearContrato(postulacionAceptada);
    expect(vm.error()).toContain('mayor que 0');

    vm.actualizarImporte(2500);
    vm.fechaInicio.set('2026-12-10');
    vm.fechaCompromiso.set('2026-12-01');
    vm.crearContrato(postulacionAceptada);
    expect(vm.error()).toContain('fecha de compromiso');
  });
});
