import { Observable } from 'rxjs';
import { IQuery } from './query';

/** Ejecuta una query y devuelve su resultado sin mutar estado de escritura. */
export interface IQueryHandler<TQuery extends IQuery<TResult>, TResult> {
  execute(query: TQuery): Observable<TResult>;
}
