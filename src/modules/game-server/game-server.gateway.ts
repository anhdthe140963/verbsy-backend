import { BadRequestException } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { HostGameDto } from './dto/host-game.dto';
import { GameServerService } from './game-server.service';

@WebSocketGateway({ cors: true })
export class GameServerGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gameServerService: GameServerService) {}
  async handleConnection(@ConnectedSocket() socket: Socket) {
    console.log(socket.id);
  }

  @SubscribeMessage('test')
  test(@MessageBody() data: any): WsResponse {
    console.log(data);

    return { event: 'test', data: `echo: ${data}` };
  }

  // @SubscribeMessage('create_lobby')
  // async createLobby(@MessageBody() data: any) {}

  // @SubscribeMessage('join_lobby')
  // async joinLobby(@MessageBody() data: any) {}

  @SubscribeMessage('get_question')
  async getQuestion(@MessageBody() data: any): Promise<boolean> {
    const question = await this.gameServerService.getQuestion(data.questionId);
    return this.server.emit('receive_question', question);
  }

  @SubscribeMessage('submit_answer')
  async submitAnswer(@MessageBody() data: any): Promise<boolean> {
    const isCorrect = await this.gameServerService.checkAnswer(data.answerId);
    return this.server.emit('check_answer', isCorrect);
  }

  @SubscribeMessage('hostNewGame')
  async hostNewGame(@MessageBody() hostGameDto: HostGameDto) {
    const game = await this.gameServerService.hostNewGame(hostGameDto);
    this.server.emit('newGameHosted', game);
  }
}
