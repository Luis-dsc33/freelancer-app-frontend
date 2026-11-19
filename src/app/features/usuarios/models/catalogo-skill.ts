export interface CategoriaSkill {
  id: string;
  nombre: string;
  descripcion?: string | null;
  activa?: boolean;
}

export interface SkillCatalogo {
  id: string;
  nombre: string;
  categoriaId: string;
  categoriaNombre?: string;
  activa?: boolean;
}

export interface CatalogoSkillsData {
  categorias: CategoriaSkill[];
  skills: SkillCatalogo[];
}
