import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MarketplaceViewModel } from './marketplace.view-model';
import { ListarOportunidadesHandler } from '../queries/listar-oportunidades.handler';
import { OportunidadProyecto } from '../models/oportunidad-proyecto';

describe('MarketplaceViewModel', () => {
  const oportunidad: OportunidadProyecto = {
    id: '1',
    titulo: 'Landing page',
    descripcion: 'Sitio corporativo',
    presupuesto: 10_000,
    esUrgente: true,
    habilidadesRequeridas: ['HTML'],
    nombreCliente: 'Cliente Demo',
    estado: 'Abierto',
    creadoEn: '2026-11-01T00:00:00Z',
  };

  it('mapea el pago estimado al listar oportunidades', () => {
    const handler = { execute: vi.fn().mockReturnValue(of([oportunidad])) };
    TestBed.configureTestingModule({
      providers: [
        MarketplaceViewModel,
        { provide: ListarOportunidadesHandler, useValue: handler },
      ],
    });

    const vm = TestBed.inject(MarketplaceViewModel);
    vm.cargar();

    expect(handler.execute).toHaveBeenCalled();
    expect(vm.oportunidades()).toHaveLength(1);
    expect(vm.oportunidades()[0].pagoEstimadoEstudiante).toBeGreaterThan(0);
    expect(vm.urgentes()).toBe(1);
    expect(vm.cargando()).toBe(false);
  });

  it('expone un mensaje claro cuando falla la query', () => {
    const handler = {
      execute: vi.fn().mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 }))),
    };
    TestBed.configureTestingModule({
      providers: [
        MarketplaceViewModel,
        { provide: ListarOportunidadesHandler, useValue: handler },
      ],
    });

    const vm = TestBed.inject(MarketplaceViewModel);
    vm.cargar();

    expect(vm.error()).toContain('No pudimos conectar');
    expect(vm.oportunidades()).toEqual([]);
  });
});
