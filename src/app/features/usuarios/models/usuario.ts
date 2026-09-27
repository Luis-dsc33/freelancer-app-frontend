export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'Estudiante' | 'Cliente' | 'Administrador';
}

export interface RegistrarUsuarioRequest {
  nombre: string;
  email: string;
  password: string;
  rol: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiraEn: string;
  nombre: string;
  rol: string;
}