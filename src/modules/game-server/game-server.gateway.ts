import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Role } from 'src/constant/role.enum';
import { User } from '../user/entity/user.entity';
import { HostGameDto } from './dto/host-game.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { GameServerService } from './game-server.service';

@WebSocketGateway({ cors: true })
export class GameServerGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly gameServerService: GameServerService,
  ) {}

  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      const bearer = socket.handshake.headers.authorization;

      const username = this.jwtService.decode(bearer)['username'];
      const user = await this.gameServerService.getUser(username);

      if (!user) {
        throw new WsException('User not exist');
      }
      socket.data.user = user;
      socket.emit(
        'socket_connected',
        'username ' + socket.data.user.username + ' has connected',
      );
    } catch (error) {
      socket.disconnect(true);
      console.log(error);
      return;
    }
  }

  @SubscribeMessage('test')
  async test(
    @MessageBody() data: { gameId: number },
    @ConnectedSocket() socc: Socket,
  ) {
    try {
      console.log(data);
      const h = await this.gameServerService.getLeaderboard(data.gameId);
      return this.server.emit('test', h);
    } catch (error) {
      return socc.emit('error', error);
    }
  }

  @SubscribeMessage('get_question')
  async getQuestion(
    @MessageBody() data: any,
    @ConnectedSocket() socc: Socket,
  ): Promise<boolean> {
    try {
      const question = await this.gameServerService.getQuestion(
        data.questionId,
      );
      return this.server.emit('receive_question', question);
    } catch (error) {
      return socc.emit('error', error);
    }
  }

  @SubscribeMessage('host_game')
  async hostGame(
    @MessageBody() hostGameDto: HostGameDto,
    @ConnectedSocket() socc: Socket,
  ) {
    try {
      const game = await this.gameServerService.hostNewGame(hostGameDto);
      const room = game.id.toString();
      socc.data.isHost = true;
      socc.join(room);

      return socc.emit('game_hosted', game);
    } catch (error) {
      return socc.emit('error', error);
    }
  }

  async getStudentList(gameId: number) {
    const room = gameId.toString();
    const sockets = await this.server.to(room).fetchSockets();
    const students = [];
    for (const s of sockets) {
      const user: User = s.data.user;
      if (user.role == Role.Student) {
        students.push(user);
      }
    }
    return students;
  }

  @SubscribeMessage('join_game')
  async joinGame(
    @MessageBody() data: { gameId: number },
    @ConnectedSocket() socc: Socket,
  ) {
    try {
      const user: User = socc.data.user;
      await this.gameServerService.joinGame(data.gameId, socc.data.user.id);
      const room = data.gameId.toString();

      if (socc.rooms.has(room)) {
        throw new WsException('User already in room');
      }
      socc.join(room);
      this.server.to(room).emit('game_joined', user);
      return this.server
        .to(room)
        .emit('lobby_updated', await this.getStudentList(data.gameId));
    } catch (error) {
      return socc.emit('error', error);
    }
  }

  @SubscribeMessage('kick_from_game')
  async kickFromGame(
    @MessageBody() data: { gameId: number; userId: number },
    @ConnectedSocket() socc: Socket,
  ) {
    try {
      if (!socc.data.isHost) {
        throw new WsException('Only Host can kick people');
      }

      const room = data.gameId.toString();
      const sockets = await this.server.to(room).fetchSockets();
      console.log(sockets.length);
      for (const s of sockets) {
        const user: User = s.data.user;

        if (user.id == data.userId) {
          s.leave(room);
          s.disconnect(true);
          console.log('kicked');

          break;
        }
      }
      this.server.to(room).emit('kicked_from_game', data.userId);
      return this.server
        .to(room)
        .emit('lobby_updated', await this.getStudentList(data.gameId));
    } catch (error) {
      return socc.emit('error', error);
    }
  }

  @SubscribeMessage('start_game')
  async startGame(
    @MessageBody() data: { gameId: number },
    @ConnectedSocket() socc: Socket,
  ) {
    const room = data.gameId.toString();
    try {
      if (!socc.data.isHost) {
        throw new WsException('Only Host can start game');
      }

      const questions = await this.gameServerService.getQuestionsForGame(
        data.gameId,
      );
      socc.emit('receive_questions', questions);

      return this.server.to(room).emit('game_started', 'Game Started');
    } catch (error) {
      return socc.emit('error', error);
    }
  }

  @SubscribeMessage('submit_answer')
  async submitAnswer(
    @MessageBody() data: SubmitAnswerDto,
    @ConnectedSocket() socc: Socket,
  ) {
    try {
      const room = data.gameId.toString();
      const user: User = socc.data.user;
      await this.gameServerService.submitAnswer(user.id, data);
      socc.emit('answer_submitted');
      const questionRecord = await this.gameServerService.getAnsweredPlayers(
        data.gameId,
        data.questionId,
      );

      const roomStudents = (await this.server.to(room).allSockets()).size - 1;

      if (questionRecord.answeredPlayers == roomStudents) {
        const leaderboard = await this.gameServerService.getLeaderboard(
          data.gameId,
        );
        return this.server.to(room).emit('question_done', {
          questionId: data.questionId,
          leaderboard: leaderboard,
        });
      }
    } catch (error) {
      return socc.emit('error', error);
    }
  }

  @SubscribeMessage('answer_timeout')
  async answerTimeout(
    @MessageBody() data: { gameId: number; questionId: number },
    @ConnectedSocket() socc: Socket,
  ) {
    try {
      const room = data.gameId.toString();
      const leaderboard = await this.gameServerService.getLeaderboard(
        data.gameId,
      );
      return this.server.to(room).emit('question_done', {
        questionId: data.questionId,
        leaderboard: leaderboard,
      });
    } catch (error) {
      return socc.emit('error', error);
    }
  }

  @SubscribeMessage('end_game')
  async endGame(
    @MessageBody() data: { gameId: number },
    @ConnectedSocket() socc: Socket,
  ) {
    try {
      if (!socc.data.isHost) {
        throw new WsException('Only Host can end game');
      }
      const room = data.gameId.toString();
      const game = await this.gameServerService.endGame(data.gameId);
      this.server.to(room).emit('game_ended', game);
      return this.server.to(room).disconnectSockets(true);
    } catch (error) {
      return socc.emit('error', error);
    }
  }
}
