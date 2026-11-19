import { calcularMatchingProyecto } from './matching-skills.util';

describe('calcularMatchingProyecto', () => {
  it('calcula coincidencia por SkillId separando requeridas y deseables', () => {
    const res = calcularMatchingProyecto(
      [
        { skillId: 'skill-1', nombreSkill: 'Angular' },
        { skillId: 'skill-3', nombreSkill: 'Docker' },
      ],
      [
        { skillId: 'skill-1', nombreSkill: 'Angular', tipoRequisito: 'Requerida' },
        { skillId: 'skill-2', nombreSkill: '.NET', tipoRequisito: 'Requerida' },
        { skillId: 'skill-3', nombreSkill: 'Docker', tipoRequisito: 'Deseable' },
      ],
    );

    expect(res.tieneDatosMatching).toBe(true);
    expect(res.requeridasCumplidas).toBe(1);
    expect(res.totalRequeridas).toBe(2);
    expect(res.deseablesCumplidas).toBe(1);
    expect(res.totalDeseables).toBe(1);
    expect(res.porcentajeRequeridas).toBe(50);
    expect(res.porcentajeTotal).toBe(60); // 0.5*80 + 1.0*20
    expect(res.skillsCoincidentes).toEqual(['Angular', 'Docker']);
    expect(res.skillsFaltantesRequeridas).toEqual(['.NET']);
  });

  it('usa respaldo por nombre cuando el proyecto solo trae habilidades de texto legado', () => {
    const res = calcularMatchingProyecto(
      [{ nombreSkill: 'TypeScript' }],
      [],
      ['typescript', 'PostgreSQL'],
      [],
    );

    expect(res.tieneDatosMatching).toBe(true);
    expect(res.requeridasCumplidas).toBe(1);
    expect(res.totalRequeridas).toBe(2);
    expect(res.porcentajeTotal).toBe(50);
    expect(res.skillsFaltantesRequeridas).toEqual(['PostgreSQL']);
  });

  it('devuelve tieneDatosMatching en false cuando el estudiante no tiene skills', () => {
    const res = calcularMatchingProyecto([], [], ['Angular']);
    expect(res.tieneDatosMatching).toBe(false);
    expect(res.porcentajeTotal).toBe(0);
    expect(res.skillsFaltantesRequeridas).toEqual(['Angular']);
  });
});
