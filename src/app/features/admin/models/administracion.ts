// ADMIN Marcos: modelos de Usuarios (HU-25), Moderación (HU-21/26) y Bitácora (HU-27).
// Equivalente en el back: Admin.Application/Dtos/AdministracionDtos.cs

export type RolUsuario = 'Estudiante' | 'Cliente' | 'Administrador';
export type TipoAccion = 'Suspender' | 'Reactivar' | 'Ocultar' | 'Restaurar';

export interface UsuarioAdmin {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  estado: 'Activo' | 'Suspendido';
  fechaRegistro: string;
}

export interface PaginaUsuarios {
  items: UsuarioAdmin[];
  total: number;
  pagina: number;
  tamanoPagina: number;
}

export interface FiltrosUsuarios {
  busqueda?: string;
  rol?: string;
  estado?: string;
  pagina: number;
}

export interface AccionAdministrativa {
  id: string;
  adminId: string;
  adminNombre: string;
  tipoAccion: TipoAccion;
  recursoTipo: 'Usuario' | 'Oferta';
  recursoId: string;
  recursoNombre: string;
  motivo: string;
  fecha: string;
}

export interface OfertaAdmin {
  id: string;
  titulo: string;
  disciplina: string;
  nombreCliente: string;
  presupuesto: number;
  estado: string;
  creadoEn: string;
}

export interface CuentaSuspendida {
  usuario: UsuarioAdmin;
  medida: AccionAdministrativa | null;
}

export interface OfertaModeracion {
  oferta: OfertaAdmin;
  medida: AccionAdministrativa | null;
}

// Cada lista es null si su servicio no respondió
export interface Moderacion {
  cuentasSuspendidas: CuentaSuspendida[] | null;
  ofertas: OfertaModeracion[] | null;
}

export interface Bitacora {
  items: AccionAdministrativa[];
  total: number;
  pagina: number;
  tamanoPagina: number;
  administradores: { id: string; nombre: string }[];
}

export interface FiltrosBitacora {
  adminId?: string;
  tipoAccion?: string;
  desde?: string;
  hasta?: string;
  pagina: number;
}
