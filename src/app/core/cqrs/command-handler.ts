import { Observable } from 'rxjs';
import { ICommand } from './command';

/** Ejecuta un command y aplica el efecto de escritura correspondiente. */
export interface ICommandHandler<TCommand extends ICommand<TResult>, TResult = void> {
  execute(command: TCommand): Observable<TResult>;
}
