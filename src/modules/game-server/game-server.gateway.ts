import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { QuestionType } from 'src/constant/question-type.enum';
import { Role } from 'src/constant/role.enum';
import { User } from '../user/entity/user.entity';
import { HostGameDto } from './dto/host-game.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { GameServerService } from './game-server.service';

@WebSocketGateway({ cors: true })
export class GameServerGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  GAME_ROOM_PREFIX = 'gameRoom:';

  constructor(
    private readonly jwtService: JwtService,
    private readonly gameServerService: GameServerService,
  ) {}
  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    try {
      if (socket.data.room) {
        const room: string = socket.data.room;
        const gameId = parseInt(room.replace(this.GAME_ROOM_PREFIX, ''));

        //Leave room and emit to room
        socket.leave(room);
        this.server
          .to(room)
          .emit('lobby_updated', await this.getStudentList(gameId));

        //Check if anyone left in room
        const socketsInGameRoom = (await this.server.to(room).allSockets())
          .size;
        if (socketsInGameRoom == 0) {
          await this.gameServerService.endGame(gameId);
        }
      }

      socket.emit(
        'socket_disconnected',
        'username ' + socket.data.user.username + ' has disconnected',
      );
    } catch (error) {
      socket.emit('error', error);
      return socket.disconnect(true);
    }
  }

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
      const h = await this.gameServerService.getAnswerStatistics(12, 1);
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

  getRoom(gameId: number): string {
    return this.GAME_ROOM_PREFIX + gameId;
  }

  @SubscribeMessage('host_game')
  async hostGame(
    @MessageBody() hostGameDto: HostGameDto,
    @ConnectedSocket() socc: Socket,
  ) {
    try {
      const game = await this.gameServerService.hostNewGame(hostGameDto);
      const room = this.getRoom(game.id);
      socc.data.isHost = true;

      socc.join(room);
      socc.data.room = room;

      return socc.emit('game_hosted', game);
    } catch (error) {
      return socc.emit('error', error);
    }
  }

  async getStudentList(gameId: number): Promise<User[]> {
    const room = this.getRoom(gameId);
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
      const room = this.getRoom(data.gameId);

      if ((await this.getStudentList(data.gameId)).includes(user)) {
        throw new WsException('User already in room');
      }

      socc.join(room);
      socc.data.room = room;
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

      const room = this.getRoom(data.gameId);
      const sockets = await this.server.to(room).fetchSockets();
      console.log(sockets.length);
      for (const s of sockets) {
        const user: User = s.data.user;

        if (user.id == data.userId) {
          s.leave(room);
          s.disconnect(true);
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
    const room = this.getRoom(data.gameId);
    try {
      if (!socc.data.isHost) {
        throw new WsException('Only Host can start game');
      }

      await this.gameServerService.startGame(
        data.gameId,
        await this.getStudentList(data.gameId),
      );
      this.server.to(room).emit('game_started', 'Game Started');

      const questions = await this.gameServerService.getQuestionsForGame(
        data.gameId,
      );
      return socc.emit('receive_questions', questions);
    } catch (error) {
      return socc.emit('error', error);
    }
  }

  @SubscribeMessage('get_next_question')
  async getNextQuestion(
    @MessageBody() data: { gameId: number; questionType: QuestionType },
    @ConnectedSocket() socc: Socket,
  ) {
    try {
      const room = this.getRoom(data.gameId);

      const nextQuestion = await this.gameServerService.getNextQuestion(
        data.gameId,
        false,
        data.questionType,
      );

      return this.server.to(room).emit('receive_next_question', nextQuestion);
    } catch (error) {
      return socc.emit('error', error);
    }
  }

  async questionDone(gameId: number, questionId: number) {
    const room = this.getRoom(gameId);

    const leaderboard = await this.gameServerService.getLeaderboard(gameId);
    const answerStatistics = await this.gameServerService.getAnswerStatistics(
      gameId,
      questionId,
    );

    return this.server.to(room).emit('question_done', {
      questionId: questionId,
      leaderboard: leaderboard,
      answerStatistics: answerStatistics,
    });
  }

  @SubscribeMessage('submit_answer')
  async submitAnswer(
    @MessageBody() data: SubmitAnswerDto,
    @ConnectedSocket() socc: Socket,
  ) {
    try {
      const user: User = socc.data.user;
      await this.gameServerService.submitAnswer(user.id, data);

      const questionRecord = await this.gameServerService.getAnsweredPlayers(
        data.gameId,
        data.questionId,
      );

      socc.emit('answer_submitted', data);

      this.server
        .to(this.getRoom(data.gameId))
        .emit('answered_players_changed', {
          answeredPlayers: questionRecord.answeredPlayers,
        });

      const roomStudents = (await this.getStudentList(data.gameId)).length;

      if (questionRecord.answeredPlayers == roomStudents) {
        return await this.questionDone(data.gameId, data.questionId);
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
      return await this.questionDone(data.gameId, data.questionId);
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
      const room = this.getRoom(data.gameId);
      const game = await this.gameServerService.endGame(data.gameId);
      this.server.to(room).emit('game_ended', game);
      return this.server.to(room).disconnectSockets(true);
    } catch (error) {
      return socc.emit('error', error);
    }
  }
}
