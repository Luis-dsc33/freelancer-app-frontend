import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { GuardarMiPerfilHandler } from '../commands/guardar-mi-perfil.handler';
import { ListarCatalogoSkillsHandler } from '../queries/listar-catalogo-skills.handler';
import { ObtenerMiPerfilHandler } from '../queries/obtener-mi-perfil.handler';
import { ObtenerReputacionUsuarioHandler } from '../queries/obtener-reputacion-usuario.handler';
import { PerfilEstudianteViewModel } from './perfil-estudiante.view-model';

describe('PerfilEstudianteViewModel', () => {
  const categorias = [{ id: 'cat-1', nombre: 'Frontend', activa: true }];
  const skills = [
    { id: 'sk-1', nombre: 'Angular', categoriaId: 'cat-1', categoriaNombre: 'Frontend', activa: true },
    { id: 'sk-2', nombre: 'TypeScript', categoriaId: 'cat-1', categoriaNombre: 'Frontend', activa: true },
  ];

  function setup(overrides?: {
    perfil$?: ReturnType<typeof of>;
    catalogo$?: ReturnType<typeof of>;
    reputacion$?: ReturnType<typeof of>;
    guardarSpy?: ReturnType<typeof vi.fn>;
  }) {
    const obtenerPerfil = {
      execute: vi.fn().mockReturnValue(
        overrides?.perfil$ ?? of({
          id: 'p-1',
          usuarioId: 'u-1',
          carrera: 'TI',
          descripcion: 'Dev frontend',
          habilidades: ['Angular'],
          skillsCatalogo: [],
          esPerfilCompleto: true,
        }),
      ),
    };
    const listarCatalogo = {
      execute: vi.fn().mockReturnValue(overrides?.catalogo$ ?? of({ categorias, skills })),
    };
    const obtenerReputacion = {
      execute: vi.fn().mockReturnValue(
        overrides?.reputacion$ ?? of({ usuarioId: 'u-1', promedio: 4.8, totalResenas: 3, resenas: [] }),
      ),
    };
    const guardarPerfil = {
      execute: overrides?.guardarSpy ?? vi.fn().mockReturnValue(of(undefined)),
    };

    TestBed.configureTestingModule({
      providers: [
        PerfilEstudianteViewModel,
        { provide: ObtenerMiPerfilHandler, useValue: obtenerPerfil },
        { provide: ListarCatalogoSkillsHandler, useValue: listarCatalogo },
        { provide: ObtenerReputacionUsuarioHandler, useValue: obtenerReputacion },
        { provide: GuardarMiPerfilHandler, useValue: guardarPerfil },
      ],
    });

    return {
      vm: TestBed.inject(PerfilEstudianteViewModel),
      guardarPerfil,
    };
  }

  it('carga perfil, concilia skills legado con catálogo y carga reputación', () => {
    const { vm } = setup();
    vm.cargar();

    expect(vm.skillsSeleccionadas().map(s => s.skillId)).toEqual(['sk-1']);
    expect(vm.habilidadesLibres()).toEqual([]);
    expect(vm.skillsDisponiblesFiltradas().map(s => s.id)).toEqual(['sk-2']);
    expect(vm.promedioCalificacion()).toBe(4.8);
    expect(vm.totalResenas()).toBe(3);
  });

  it('permite agregar, cambiar nivel y guardar skills del catálogo', () => {
    const guardarSpy = vi.fn().mockReturnValue(of(undefined));
    const { vm } = setup({ guardarSpy });
    vm.cargar();

    vm.agregarSkillCatalogo(skills[1], 'Avanzado');
    vm.cambiarNivelSkill('sk-1', 'Basico');
    vm.guardar('Ingeniería TI', 'Experiencia fullstack').subscribe();

    expect(guardarSpy).toHaveBeenCalledTimes(1);
    const cmd = guardarSpy.mock.calls[0][0];
    expect(cmd.actualizar).toBe(true);
    expect(cmd.payload.skillsCatalogo).toEqual([
      { skillId: 'sk-1', nombreSkill: 'Angular', nivelDominio: 'Basico' },
      { skillId: 'sk-2', nombreSkill: 'TypeScript', nivelDominio: 'Avanzado' },
    ]);
    expect(cmd.payload.habilidades).toEqual(['Angular', 'TypeScript']);
    expect(vm.mensajeExito()).toContain('guardado');
  });

  it('no falla el perfil si reputación devuelve 404 aún', () => {
    const { vm } = setup({
      reputacion$: throwError(() => new HttpErrorResponse({ status: 404 })),
    });
    vm.cargar();

    expect(vm.error()).toBe('');
    expect(vm.reputacion()).toBeNull();
  });
});
