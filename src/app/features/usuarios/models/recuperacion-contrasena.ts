export interface SolicitarRecuperacionRequest { email: string; }
export interface SolicitarRecuperacionResponse { mensaje: string; }
export interface RestablecerContrasenaRequest {
  token: string;
  password: string;
  confirmarPassword: string;
}
export interface ErrorRecuperacion {
  error?: string;
  errores?: { campo: string; mensaje: string }[];
}
export type EstadoRecuperacion = 'formulario' | 'enviado' | 'actualizado' | 'invalido';
