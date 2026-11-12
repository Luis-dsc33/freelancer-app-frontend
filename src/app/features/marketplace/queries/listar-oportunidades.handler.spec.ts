import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ListarOportunidadesHandler } from './listar-oportunidades.handler';
import { ListarOportunidadesQuery } from './listar-oportunidades.query';
import { OPORTUNIDAD_PROYECTO_REPOSITORY } from '../data/oportunidad-proyecto.repository';

describe('ListarOportunidadesHandler', () => {
  it('delega la lectura al repositorio', () => {
    const repositorio = {
      listarOportunidades: vi.fn().mockReturnValue(of([])),
    };

    TestBed.configureTestingModule({
      providers: [
        ListarOportunidadesHandler,
        { provide: OPORTUNIDAD_PROYECTO_REPOSITORY, useValue: repositorio },
      ],
    });

    const handler = TestBed.inject(ListarOportunidadesHandler);
    handler.execute(new ListarOportunidadesQuery()).subscribe();

    expect(repositorio.listarOportunidades).toHaveBeenCalledTimes(1);
  });
});
