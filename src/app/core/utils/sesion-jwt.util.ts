export interface SesionJwt {
  expiraEnMs: number;
  rol: string | null;
  nombre: string | null;
  usuarioId: string | null;
}

const CLAIM_ROLE =
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const CLAIM_NAME =
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/name';
const CLAIM_NAME_IDENTIFIER =
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier';

function decodificarPayload(token: string): Record<string, unknown> {
  const partes = token.split('.');
  if (partes.length !== 3) throw new Error('Token inválido');
  const payload = partes[1].replace(/-/g, '+').replace(/_/g, '/');
  const json = atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '='));
  return JSON.parse(json) as Record<string, unknown>;
}

function leerTexto(claims: Record<string, unknown>, ...claves: string[]): string | null {
  for (const clave of claves) {
    const valor = claims[clave];
    if (typeof valor === 'string' && valor.trim()) return valor;
  }
  return null;
}

/** Lee el JWT guardado en localStorage. Devuelve null si no hay sesión usable. */
export function leerSesionJwt(tokenKey = 'jwt_token'): SesionJwt | null {
  try {
    const token = localStorage.getItem(tokenKey);
    if (!token) return null;
    const claims = decodificarPayload(token);
    if (typeof claims['exp'] !== 'number') return null;
    const expiraEnMs = claims['exp'] * 1000;
    if (expiraEnMs <= Date.now()) return null;

    return {
      expiraEnMs,
      rol: leerTexto(claims, CLAIM_ROLE, 'role', 'rol'),
      nombre: leerTexto(claims, CLAIM_NAME, 'name', 'nombre'),
      usuarioId: leerTexto(claims, CLAIM_NAME_IDENTIFIER, 'sub', 'usuarioId'),
    };
  } catch {
    return null;
  }
}
