import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { AbrirConversacionHandler } from '../commands/abrir-conversacion.handler';
import { EnviarMensajeChatHandler } from '../commands/enviar-mensaje-chat.handler';
import { CHAT_REALTIME_PORT, IChatRealtimePort } from '../data/chat-realtime.port';
import { ConversacionChat, EstadoTiempoRealChat, MensajeChat } from '../models/chat';
import { ListarMensajesConversacionHandler } from '../queries/listar-mensajes-conversacion.handler';
import { ListarMisConversacionesHandler } from '../queries/listar-mis-conversaciones.handler';
import { ChatEstudianteViewModel } from './chat-estudiante.view-model';

describe('ChatEstudianteViewModel', () => {
  const conv: ConversacionChat = {
    id: 'conv-1',
    proyectoId: 'proy-1',
    tituloProyecto: 'App móvil',
    clienteId: 'cli-1',
    estudianteId: 'est-1',
    nombreContraparte: 'Acme Corp',
  };

  it('carga conversaciones, selecciona la primera, envía mensajes y escucha tiempo real', () => {
    const mensajes$ = new Subject<MensajeChat>();
    const realtime: IChatRealtimePort = {
      estadoConexion: signal<EstadoTiempoRealChat>('modo_http'),
      mensajesEntrantes$: mensajes$.asObservable(),
      conectar: vi.fn().mockResolvedValue(undefined),
      unirseAConversacion: vi.fn().mockResolvedValue(undefined),
      salirDeConversacion: vi.fn().mockResolvedValue(undefined),
      desconectar: vi.fn().mockResolvedValue(undefined),
    };

    const listarConv = { execute: vi.fn().mockReturnValue(of([conv])) };
    const listarMsgs = { execute: vi.fn().mockReturnValue(of([])) };
    const abrirConv = { execute: vi.fn().mockReturnValue(of(conv)) };
    const enviarMsg = {
      execute: vi.fn().mockReturnValue(
        of({
          id: 'm-1',
          conversacionId: 'conv-1',
          remitenteId: 'est-1',
          contenido: 'Hola cliente',
          enviadoEn: '2026-11-19T02:00:00Z',
        }),
      ),
    };

    TestBed.configureTestingModule({
      providers: [
        ChatEstudianteViewModel,
        { provide: ListarMisConversacionesHandler, useValue: listarConv },
        { provide: ListarMensajesConversacionHandler, useValue: listarMsgs },
        { provide: AbrirConversacionHandler, useValue: abrirConv },
        { provide: EnviarMensajeChatHandler, useValue: enviarMsg },
        { provide: CHAT_REALTIME_PORT, useValue: realtime },
      ],
    });

    const vm = TestBed.inject(ChatEstudianteViewModel);
    vm.cargar();

    expect(vm.conversacionActiva()?.id).toBe('conv-1');
    expect(realtime.unirseAConversacion).toHaveBeenCalledWith('conv-1');

    vm.mensajeInput.set('Hola cliente');
    vm.enviarMensaje();
    expect(vm.mensajes()).toHaveLength(1);
    expect(vm.mensajeInput()).toBe('');

    mensajes$.next({
      id: 'm-2',
      conversacionId: 'conv-1',
      remitenteId: 'cli-1',
      contenido: 'Hola estudiante',
      enviadoEn: '2026-11-19T02:01:00Z',
    });
    expect(vm.mensajes()).toHaveLength(2);
  });
});
