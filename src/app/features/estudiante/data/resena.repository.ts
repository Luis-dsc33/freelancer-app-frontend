import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { CalificarClienteRequest, ResenaCreada } from '../models/resena';

/** Abstracción de acceso a reseñas en Resenas.Api (DIP). */
export interface IResenaRepository {
  calificarCliente(contratoId: string, request: CalificarClienteRequest): Observable<ResenaCreada>;
  listarMisResenasEmitidas(): Observable<ResenaCreada[]>;
}

export const RESENA_REPOSITORY =
  new InjectionToken<IResenaRepository>('RESENA_REPOSITORY');
