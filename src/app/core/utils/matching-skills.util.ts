export interface SkillEstudianteEntrada {
  skillId?: string;
  nombreSkill: string;
}

export interface SkillProyectoEntrada {
  skillId?: string;
  nombreSkill: string;
  tipoRequisito: 'Requerida' | 'Deseable';
}

export interface ResultadoMatchingProyecto {
  tieneDatosMatching: boolean;
  porcentajeTotal: number;
  porcentajeRequeridas: number;
  requeridasCumplidas: number;
  totalRequeridas: number;
  deseablesCumplidas: number;
  totalDeseables: number;
  skillsCoincidentes: string[];
  skillsFaltantesRequeridas: string[];
  skillsFaltantesDeseables: string[];
}

function normalizarNombre(nombre: string): string {
  return nombre.trim().toLowerCase();
}

/**
 * Calcula la compatibilidad entre las habilidades del estudiante y las de una oportunidad.
 * Prioriza coincidencia exacta por `skillId` y usa nombre normalizado como respaldo legado.
 */
export function calcularMatchingProyecto(
  estudianteSkills: readonly SkillEstudianteEntrada[],
  proyectoSkills: readonly SkillProyectoEntrada[],
  habilidadesRequeridasLegado: readonly string[] = [],
  habilidadesDeseablesLegado: readonly string[] = [],
): ResultadoMatchingProyecto {
  const catalogoProyecto: SkillProyectoEntrada[] = proyectoSkills.length > 0
    ? [...proyectoSkills]
    : [
        ...habilidadesRequeridasLegado.map(nombre => ({
          nombreSkill: nombre,
          tipoRequisito: 'Requerida' as const,
        })),
        ...habilidadesDeseablesLegado.map(nombre => ({
          nombreSkill: nombre,
          tipoRequisito: 'Deseable' as const,
        })),
      ];

  if (catalogoProyecto.length === 0 || estudianteSkills.length === 0) {
    const req = catalogoProyecto.filter(s => s.tipoRequisito === 'Requerida');
    const des = catalogoProyecto.filter(s => s.tipoRequisito === 'Deseable');
    return {
      tieneDatosMatching: false,
      porcentajeTotal: 0,
      porcentajeRequeridas: 0,
      requeridasCumplidas: 0,
      totalRequeridas: req.length,
      deseablesCumplidas: 0,
      totalDeseables: des.length,
      skillsCoincidentes: [],
      skillsFaltantesRequeridas: req.map(s => s.nombreSkill),
      skillsFaltantesDeseables: des.map(s => s.nombreSkill),
    };
  }

  const idsEstudiante = new Set(
    estudianteSkills
      .map(s => s.skillId?.trim().toLowerCase())
      .filter((id): id is string => !!id),
  );
  const nombresEstudiante = new Set(
    estudianteSkills.map(s => normalizarNombre(s.nombreSkill)).filter(Boolean),
  );

  const coincide = (skill: SkillProyectoEntrada): boolean => {
    const id = skill.skillId?.trim().toLowerCase();
    if (id && idsEstudiante.has(id)) {
      return true;
    }
    return nombresEstudiante.has(normalizarNombre(skill.nombreSkill));
  };

  const requeridas = catalogoProyecto.filter(s => s.tipoRequisito === 'Requerida');
  const deseables = catalogoProyecto.filter(s => s.tipoRequisito === 'Deseable');

  const skillsCoincidentes: string[] = [];
  const skillsFaltantesRequeridas: string[] = [];
  const skillsFaltantesDeseables: string[] = [];

  let requeridasCumplidas = 0;
  for (const skill of requeridas) {
    if (coincide(skill)) {
      requeridasCumplidas += 1;
      skillsCoincidentes.push(skill.nombreSkill);
    } else {
      skillsFaltantesRequeridas.push(skill.nombreSkill);
    }
  }

  let deseablesCumplidas = 0;
  for (const skill of deseables) {
    if (coincide(skill)) {
      deseablesCumplidas += 1;
      skillsCoincidentes.push(skill.nombreSkill);
    } else {
      skillsFaltantesDeseables.push(skill.nombreSkill);
    }
  }

  const porcentajeRequeridas = requeridas.length > 0
    ? Math.round((requeridasCumplidas / requeridas.length) * 100)
    : 100;

  let porcentajeTotal = 0;
  if (requeridas.length > 0 && deseables.length > 0) {
    const ratioReq = requeridasCumplidas / requeridas.length;
    const ratioDes = deseablesCumplidas / deseables.length;
    porcentajeTotal = Math.round((ratioReq * 0.8 + ratioDes * 0.2) * 100);
  } else if (requeridas.length > 0) {
    porcentajeTotal = porcentajeRequeridas;
  } else if (deseables.length > 0) {
    porcentajeTotal = Math.round((deseablesCumplidas / deseables.length) * 100);
  }

  return {
    tieneDatosMatching: true,
    porcentajeTotal,
    porcentajeRequeridas,
    requeridasCumplidas,
    totalRequeridas: requeridas.length,
    deseablesCumplidas,
    totalDeseables: deseables.length,
    skillsCoincidentes,
    skillsFaltantesRequeridas,
    skillsFaltantesDeseables,
  };
}
