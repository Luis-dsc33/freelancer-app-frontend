import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ContratoCliente,
  OfertaCliente,
  PostulacionCliente,
  PublicarOfertaRequest,
  SkillCatalogoCliente,
} from '../models/oferta-cliente';

/** El formulario captura el presupuesto en pesos mexicanos; el backend exige `moneda`. */
const MONEDA = 'MXN';
/** GUID semilla del catálogo inicial ("Trabajo en equipo") usado como respaldo si aún no hay selección. */
const DEFAULT_SKILL_ID = '496ed55f-5ef0-6204-3b0e-7968329bd8b8';

@Injectable({ providedIn: 'root' })
export class OfertasClienteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.gatewayUrl}/api/marketplace/proyectos`;

  listarSkillsCatalogo(): Observable<SkillCatalogoCliente[]> {
    return this.http.get<SkillCatalogoCliente[]>(
      `${environment.gatewayUrl}/api/marketplace/catalogo/habilidades`,
    );
  }

  publicarOferta(datos: PublicarOfertaRequest): Observable<OfertaCliente> {
    return this.http.post<OfertaCliente>(this.baseUrl, this.construirPayloadOferta(datos)).pipe(
      switchMap(oferta => (
        oferta?.id && oferta.estado?.toLowerCase() === 'borrador'
          ? this.publicarOfertaExistente(oferta.id).pipe(catchError(() => of(oferta)))
          : of(oferta)
      )),
    );
  }

  publicarOfertaExistente(id: string): Observable<OfertaCliente> {
    return this.http.put<OfertaCliente>(`${this.baseUrl}/${encodeURIComponent(id)}/publicar`, {});
  }

  listarMisOfertas(): Observable<OfertaCliente[]> {
    return this.http
      .get<OfertaCliente[] | { items?: OfertaCliente[] }>(`${this.baseUrl}/mis-ofertas`)
      .pipe(map(r => (Array.isArray(r) ? r : r?.items ?? [])));
  }

  actualizarOferta(id: string, datos: PublicarOfertaRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${encodeURIComponent(id)}`, this.construirPayloadOferta(datos));
  }

  private construirPayloadOferta(datos: PublicarOfertaRequest) {
    const habilidadesRequeridas = datos.habilidadesRequeridas?.length
      ? datos.habilidadesRequeridas
      : [DEFAULT_SKILL_ID];

    return {
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      disciplina: datos.disciplina,
      presupuesto: datos.presupuesto,
      presupuestoMinimo: null,
      presupuestoMaximo: null,
      tipoPresupuesto: datos.tipoPresupuesto ?? 0,
      moneda: datos.moneda ?? MONEDA,
      fechaLimite: datos.fechaLimite,
      fechaEntregaEstimada: null,
      modalidad: datos.modalidad ?? 0,
      ubicacion: datos.ubicacion ?? null,
      alcance: null,
      habilidadesRequeridas,
      habilidadesDeseables: [],
      entregables: [],
      nivelAvance: null,
      nivelAcademicoSugerido: null,
      requierePortafolio: datos.requierePortafolio ?? false,
      dedicacionSemanalEstimada: null,
      flexibilidadHorario: null,
      esquemaPago: datos.esquemaPago ?? 0,
      hitosPago: [],
      gastosAdicionales: null,
      cantidadVacantes: datos.cantidadVacantes ?? 1,
      permitePortafolioPublico: false,
      requiereConfidencialidad: false,
      propiedadIntelectual: null,
    };
  }

  cerrarOferta(id: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${encodeURIComponent(id)}/cerrar`, {});
  }

  eliminarOferta(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }

  listarPostulaciones(ofertaId: string): Observable<PostulacionCliente[]> {
    return this.http.get<PostulacionCliente[]>(
      `${environment.gatewayUrl}/api/marketplace/ofertas/${encodeURIComponent(ofertaId)}/postulaciones`,
    );
  }

  aceptarPostulacion(id: string): Observable<void> {
    return this.http.put<void>(
      `${environment.gatewayUrl}/api/marketplace/postulaciones/${encodeURIComponent(id)}/aceptar`,
      {},
    );
  }

  rechazarPostulacion(id: string): Observable<void> {
    return this.http.put<void>(
      `${environment.gatewayUrl}/api/marketplace/postulaciones/${encodeURIComponent(id)}/rechazar`,
      {},
    );
  }

  crearContrato(postulacionId: string): Observable<unknown> {
    return this.http.post(`${environment.gatewayUrl}/api/marketplace/contratos`, { postulacionId });
  }

  listarMisContratos(): Observable<ContratoCliente[]> {
    return this.http.get<ContratoCliente[]>(`${environment.gatewayUrl}/api/marketplace/contratos/mis-contratos`);
  }

  finalizarContrato(id: string): Observable<void> {
    return this.http.put<void>(
      `${environment.gatewayUrl}/api/marketplace/contratos/${encodeURIComponent(id)}/finalizar`,
      {},
    );
  }

  cancelarContrato(id: string): Observable<void> {
    return this.http.put<void>(
      `${environment.gatewayUrl}/api/marketplace/contratos/${encodeURIComponent(id)}/cancelar`,
      {},
    );
  }
}
