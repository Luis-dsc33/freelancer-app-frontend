/** Marcador de operaciones que cambian estado (CQRS). */
export interface ICommand<TResult = void> {
  readonly __result?: TResult;
}
