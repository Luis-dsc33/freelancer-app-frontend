import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { extraerMensajeErrorHttp } from '../../../core/utils/http-error.util';
import { leerSesionJwt } from '../../../core/utils/sesion-jwt.util';
import { AbrirConversacionCommand } from '../commands/abrir-conversacion.command';
import { AbrirConversacionHandler } from '../commands/abrir-conversacion.handler';
import { EnviarMensajeChatCommand } from '../commands/enviar-mensaje-chat.command';
import { EnviarMensajeChatHandler } from '../commands/enviar-mensaje-chat.handler';
import { CHAT_REALTIME_PORT } from '../data/chat-realtime.port';
import { AbrirConversacionRequest, ConversacionChat, MensajeChat } from '../models/chat';
import { ListarMensajesConversacionHandler } from '../queries/listar-mensajes-conversacion.handler';
import { ListarMensajesConversacionQuery } from '../queries/listar-mensajes-conversacion.query';
import { ListarMisConversacionesHandler } from '../queries/listar-mis-conversaciones.handler';
import { ListarMisConversacionesQuery } from '../queries/listar-mis-conversaciones.query';

/** ViewModel de Chat del Estudiante (MVVM + CQRS + puerto de tiempo real desacoplado). */
@Injectable()
export class ChatEstudianteViewModel {
  private readonly listarConversacionesHandler = inject(ListarMisConversacionesHandler);
  private readonly listarMensajesHandler = inject(ListarMensajesConversacionHandler);
  private readonly abrirConversacionHandler = inject(AbrirConversacionHandler);
  private readonly enviarMensajeHandler = inject(EnviarMensajeChatHandler);
  private readonly realtime = inject(CHAT_REALTIME_PORT);
  private readonly destroyRef = inject(DestroyRef);

  readonly conversaciones = signal<ConversacionChat[]>([]);
  readonly conversacionActiva = signal<ConversacionChat | null>(null);
  readonly mensajes = signal<MensajeChat[]>([]);
  readonly mensajeInput = signal('');

  readonly cargandoConversaciones = signal(false);
  readonly cargandoMensajes = signal(false);
  readonly enviando = signal(false);
  readonly error = signal('');
  readonly estadoTiempoReal = this.realtime.estadoConexion;
  /** `true` cuando la contraparte ejecutó `JoinConversation` en la conversación activa. */
  readonly contraparteEnLinea = signal(false);

  readonly miUsuarioId = computed(() => leerSesionJwt()?.usuarioId ?? null);

  constructor() {
    this.realtime.mensajesEntrantes$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(msg => {
        const activa = this.conversacionActiva();
        if (activa && msg.conversacionId === activa.id) {
          this.agregarMensajeSinDuplicado(msg);
        }
        this.conversaciones.update(lista =>
          lista.map(c =>
            c.id === msg.conversacionId
              ? { ...c, ultimoMensaje: msg.contenido, ultimaActividadEn: msg.enviadoEn }
              : c,
          ),
        );
      });

    // Presencia: la contraparte entró a la sala de la conversación activa.
    this.realtime.participanteConectado$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(evento => {
        const activa = this.conversacionActiva();
        if (
          activa &&
          evento.conversacionId === activa.id &&
          evento.usuarioId !== this.miUsuarioId()
        ) {
          this.contraparteEnLinea.set(true);
        }
      });

    this.destroyRef.onDestroy(() => {
      const activa = this.conversacionActiva();
      const salir = activa ? this.realtime.salirDeConversacion(activa.id) : Promise.resolve();
      void salir.finally(() => this.realtime.desconectar());
    });
  }

  cargar(contextoInicial?: AbrirConversacionRequest | null): void {
    const token = this.leerToken();
    if (token) {
      void this.realtime.conectar(token);
    }

    this.cargandoConversaciones.set(true);
    this.error.set('');

    this.listarConversacionesHandler
      .execute(new ListarMisConversacionesQuery())
      .pipe(finalize(() => this.cargandoConversaciones.set(false)))
      .subscribe({
        next: lista => {
          this.conversaciones.set(lista);
          if (contextoInicial?.proyectoId) {
            this.abrirDesdeContexto(contextoInicial);
          } else if (lista.length > 0 && !this.conversacionActiva()) {
            this.seleccionarConversacion(lista[0]);
          }
        },
        error: (err: HttpErrorResponse) => {
          if (contextoInicial?.proyectoId && err.status !== 401 && err.status !== 403) {
            this.abrirDesdeContexto(contextoInicial);
            return;
          }
          this.error.set(
            extraerMensajeErrorHttp(err, {
              mensajesEstado: {
                404: 'El microservicio de Chat aún no está disponible en el gateway.',
              },
              fallback: 'No se pudieron cargar tus conversaciones.',
            }),
          );
        },
      });
  }

  abrirDesdeContexto(request: AbrirConversacionRequest): void {
    this.error.set('');
    this.abrirConversacionHandler.execute(new AbrirConversacionCommand(request)).subscribe({
      next: conv => {
        this.conversaciones.update(actual =>
          actual.some(c => c.id === conv.id) ? actual : [conv, ...actual],
        );
        this.seleccionarConversacion(conv);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(
          extraerMensajeErrorHttp(err, {
            mensajesEstado: {
              403: 'Necesitas una postulación o contrato activo en la oferta para iniciar chat.',
              404: 'El microservicio de Chat aún no está disponible en el gateway.',
            },
            fallback: 'No se pudo abrir la conversación con el cliente.',
          }),
        );
      },
    });
  }

  seleccionarConversacion(conv: ConversacionChat): void {
    const anterior = this.conversacionActiva();
    if (anterior && anterior.id !== conv.id) {
      void this.realtime.salirDeConversacion(anterior.id);
    }

    if (!anterior || anterior.id !== conv.id) {
      this.contraparteEnLinea.set(false);
    }
    this.conversacionActiva.set(conv);
    void this.realtime.unirseAConversacion(conv.id);

    this.cargandoMensajes.set(true);
    this.error.set('');
    this.listarMensajesHandler
      .execute(new ListarMensajesConversacionQuery(conv.id))
      .pipe(finalize(() => this.cargandoMensajes.set(false)))
      .subscribe({
        next: items => this.mensajes.set(items),
        error: (err: HttpErrorResponse) => {
          this.mensajes.set([]);
          this.error.set(
            extraerMensajeErrorHttp(err, {
              fallback: 'No se pudo cargar el historial de mensajes.',
            }),
          );
        },
      });
  }

  enviarMensaje(): void {
    const conv = this.conversacionActiva();
    const contenido = this.mensajeInput().trim();
    if (!conv || !contenido || this.enviando()) return;

    if (contenido.length > 2000) {
      this.error.set('El mensaje no puede superar los 2000 caracteres.');
      return;
    }

    this.enviando.set(true);
    this.error.set('');

    this.enviarMensajeHandler
      .execute(new EnviarMensajeChatCommand(conv.id, contenido))
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: creado => {
          this.agregarMensajeSinDuplicado(creado);
          this.mensajeInput.set('');
          this.conversaciones.update(lista =>
            lista.map(c =>
              c.id === conv.id
                ? { ...c, ultimoMensaje: creado.contenido, ultimaActividadEn: creado.enviadoEn }
                : c,
            ),
          );
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(
            extraerMensajeErrorHttp(err, {
              fallback: 'No se pudo enviar el mensaje.',
            }),
          );
        },
      });
  }

  esMensajePropio(mensaje: MensajeChat): boolean {
    const miId = this.miUsuarioId();
    return Boolean(miId && mensaje.remitenteId === miId);
  }

  private agregarMensajeSinDuplicado(mensaje: MensajeChat): void {
    this.mensajes.update(actual =>
      actual.some(m => m.id === mensaje.id) ? actual : [...actual, mensaje],
    );
  }

  private leerToken(): string {
    try {
      return localStorage.getItem('jwt_token') ?? '';
    } catch {
      return '';
    }
  }
}
