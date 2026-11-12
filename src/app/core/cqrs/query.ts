/** Marcador de consultas de solo lectura (CQRS). */
export interface IQuery<TResult> {
  readonly __result?: TResult;
}
