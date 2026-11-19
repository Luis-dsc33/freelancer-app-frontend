import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { ContratoEstudiante } from '../models/contrato';

/** Abstracción de acceso a contratos del estudiante en Marketplace.Api (DIP). */
export interface IContratoRepository {
  listarMisContratos(): Observable<ContratoEstudiante[]>;
  finalizarContrato(contratoId: string): Observable<void>;
  cancelarContrato(contratoId: string): Observable<void>;
}

export const CONTRATO_REPOSITORY =
  new InjectionToken<IContratoRepository>('CONTRATO_REPOSITORY');
