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
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { GameServerService } from './game-server.service';

@WebSocketGateway({ cors: true })
export class GameServerGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server = new Server({});

  GAME_ROOM_PREFIX = 'gameRoom:';

  constructor(
    private readonly jwtService: JwtService,
    private readonly gameServerService: GameServerService,
  ) {}

  //Utils
  getRoom(gameId: number): string {
    return this.GAME_ROOM_PREFIX + gameId;
  }

  async getInGameStudentList(gameId: number): Promise<User[]> {
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

  async finishQuestion(gameId: number, questionId: number) {
    try {
      const room = this.getRoom(gameId);

      await this.gameServerService.finishQuestion(gameId, questionId);
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
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  //Implement Interfaces
  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    try {
      if (socket.data.room) {
        const room: string = socket.data.room;
        const gameId = parseInt(room.replace(this.GAME_ROOM_PREFIX, ''));

        if (socket.data.isHost) {
          this.server.to(room).emit('host_disconnected');
        }
        //Leave room and emit to room
        socket.leave(room);
        this.server
          .to(room)
          .emit('lobby_updated', await this.getInGameStudentList(gameId));

        //Check if anyone left in room
        const socketsInGameRoom = (await this.server.to(room).allSockets())
          .size;
        if (socketsInGameRoom == 0) {
          await this.gameServerService.endGame(gameId);
        }
      }

      console.log(socket.rooms);
      console.log(socket.data.user.username + ' has disconnected');
    } catch (error) {
      socket.emit('error', error);
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

      console.log(socket.rooms);

      console.log(socket.data.user.username + ' has connected');

      socket.emit(
        'socket_connected',
        'username ' + socket.data.user.username + ' has connected',
      );
    } catch (error) {
      console.log(error);
      socket.emit('error', error);
    }
  }

  //Messages Handling
  @SubscribeMessage('test')
  async test(
    @MessageBody() data: { gameId: number },
    @ConnectedSocket() socc: Socket,
  ) {
    try {
      console.log(data);
      const students = await this.getInGameStudentList(data.gameId);
      const h = await this.gameServerService.getGameStudentsList(21, students);
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
    @MessageBody() data: { lectureId: number; classId: number },
    @ConnectedSocket() socc: Socket,
  ) {
    try {
      const user: User = socc.data.user;
      const game = await this.gameServerService.hostGame(
        data.lectureId,
        data.classId,
        user.id,
      );
      const room = this.getRoom(game.id);

      socc.join(room);
      socc.data.isHost = true;
      socc.data.room = room;

      return socc.emit('game_hosted', game);
    } catch (error) {
      console.log(error);

      return socc.emit('error', error);
    }
  }

  @SubscribeMessage('get_game_info')
  async getGameInfo(
    @MessageBody() data: { gameId: number },
    @ConnectedSocket() socc: Socket,
  ) {
    try {
      const gameInfo = await this.gameServerService.getGameInfo(data.gameId);

      return socc.emit('receive_game_info', gameInfo);
    } catch (error) {
      console.log(error);

      return socc.emit('error', error);
    }
  }

  @SubscribeMessage('get_students_list')
  async getStudentsList(
    @MessageBody() data: { gameId: number; classId: number },
    @ConnectedSocket() socc: Socket,
  ) {
    try {
      const inGameStudents = await this.getInGameStudentList(data.gameId);
      const students = await this.gameServerService.getGameStudentsList(
        data.classId,
        inGameStudents,
      );

      return socc.emit('receive_students_list', students);
    } catch (error) {
      console.log(error);
      return socc.emit('error', error);
    }
  }

  @SubscribeMessage('join_game')
  async joinGame(
    @MessageBody() data: { gameId: number },
    @ConnectedSocket() socc: Socket,
  ) {
    try {
      const user: User = socc.data.user;
      const room = this.getRoom(data.gameId);
      const blacklist = await this.gameServerService.getBlacklist(data.gameId);

      for (const bl of blacklist) {
        if (bl.id == user.id) {
          throw new WsException('User is blacklisted');
        }
      }

      if ((await this.getInGameStudentList(data.gameId)).includes(user)) {
        throw new WsException('User already in room');
      }

      socc.join(room);
      socc.data.room = room;

      //Handle reconnect
      const isReconnect = await this.gameServerService.isReconnect(
        data.gameId,
        user.id,
      );
      if (isReconnect) {
        return this.server.to(room).emit('player_has_reconnected', user);
      }

      this.server.to(room).emit('game_joined', user);
      return this.server
        .to(room)
        .emit('lobby_updated', await this.getInGameStudentList(data.gameId));
    } catch (error) {
      return socc.emit('error', error);
    }
  }

  @SubscribeMessage('save_game_state')
  async saveGameState(
    @MessageBody()
    data: { gameId: number; currentQuestionId: number; timeLeft: number },
    @ConnectedSocket() socc: Socket,
  ) {
    try {
      const gameState = await this.gameServerService.saveGameState(
        data.gameId,
        data.currentQuestionId,
        data.timeLeft,
      );

      return socc.emit('saved_game_state', gameState);
    } catch (error) {
      console.log(error);
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
        .emit('lobby_updated', await this.getInGameStudentList(data.gameId));
    } catch (error) {
      return socc.emit('error', error);
    }
  }

  @SubscribeMessage('get_blacklist')
  async getBlacklist(
    @MessageBody() data: { gameId: number; userId: number },
    @ConnectedSocket() socc: Socket,
  ) {
    try {
      const blacklist = await this.gameServerService.getBlacklist(data.gameId);

      return socc.emit('blacklist_changed', blacklist);
    } catch (error) {
      return socc.emit('error', error);
    }
  }

  @SubscribeMessage('add_to_blacklist')
  async addToBlacklist(
    @MessageBody() data: { gameId: number; userId: number },
    @ConnectedSocket() socc: Socket,
  ) {
    try {
      if (!socc.data.isHost) {
        throw new WsException('Only Host can blacklist people');
      }

      const bl = await this.gameServerService.addToBlacklist(
        data.gameId,
        data.userId,
      );

      if (!bl) {
        throw new WsException('User already in blacklist');
      }

      const blacklist = await this.gameServerService.getBlacklist(data.gameId);

      return socc.emit('blacklist_changed', blacklist);
    } catch (error) {
      return socc.emit('error', error);
    }
  }

  @SubscribeMessage('remove_from_blacklist')
  async removedFromBlacklist(
    @MessageBody() data: { gameId: number; userId: number },
    @ConnectedSocket() socc: Socket,
  ) {
    try {
      if (!socc.data.isHost) {
        throw new WsException('Only Host can remove people from blacklist');
      }

      await this.gameServerService.removeFromBlacklist(
        data.gameId,
        data.userId,
      );

      const blacklist = await this.gameServerService.getBlacklist(data.gameId);

      return socc.emit('blacklist_changed', blacklist);
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
        await this.getInGameStudentList(data.gameId),
      );
      await this.gameServerService.prepareQuestionType(data.gameId);
      return this.server.to(room).emit('game_started', 'Game Started');
    } catch (error) {
      console.log(error);
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

  @SubscribeMessage('submit_answer')
  async submitAnswer(
    @MessageBody() data: SubmitAnswerDto,
    @ConnectedSocket() socc: Socket,
  ) {
    try {
      const room = this.getRoom(data.gameId);
      const user: User = socc.data.user;
      const submittedAnswer = await this.gameServerService.submitAnswer(
        user.id,
        data,
      );

      socc.emit('answer_submitted', submittedAnswer);

      const answeredPlayers = await this.gameServerService.getAnsweredPlayers(
        data.gameId,
        data.questionId,
      );

      const studentsStatistics =
        await this.gameServerService.getStudentsStatistics(data.gameId);
      this.server
        .to(room)
        .emit(
          'answered_players_changed',
          Object.assign({ answeredPlayers }, { studentsStatistics }),
        );

      const roomStudents = (await this.getInGameStudentList(data.gameId))
        .length;

      if (answeredPlayers == roomStudents) {
        await this.finishQuestion(data.gameId, data.questionId);
      }
    } catch (error) {
      return socc.emit('error', error);
    }
  }

  @SubscribeMessage('get_leaderboard')
  async getLeaderBoard(
    @MessageBody() data: { gameId: number; questionId: number },
    @ConnectedSocket() socc: Socket,
  ) {
    try {
      const room = this.getRoom(data.gameId);
      const leaderboard = await this.gameServerService.getLeaderboard(
        data.gameId,
      );

      return this.server.to(room).emit('receive_leaderboard', leaderboard);
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
      await this.finishQuestion(data.gameId, data.questionId);
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

  @SubscribeMessage('host_reconnect')
  async handleHostReconnect(
    @MessageBody()
    data: { gameId: number },
    @ConnectedSocket() socc: Socket,
  ) {
    try {
      const room = this.getRoom(data.gameId);
      socc.join(room);
      socc.data.isHost = true;
      socc.data.room = room;
      this.server.to(room).emit('host_reconnected');
      const gameState = await this.gameServerService.getGameState(data.gameId);
      socc.emit('receive_game_state', gameState);
    } catch (error) {
      return socc.emit('error', error);
    }
  }

  @SubscribeMessage('player_left')
  async handlePlayerLeft(
    @MessageBody()
    data: { gameId: number },
    @ConnectedSocket() socc: Socket,
  ) {
    try {
      const room = this.getRoom(data.gameId);
      this.server.to(room).emit('player_has_left', socc.data.user);
    } catch (error) {
      return socc.emit('error', error);
    }
  }

  @SubscribeMessage('transfer_question_to_player')
  async handlePlayerReconnect(
    @MessageBody()
    data: {
      gameId: number;
      userId: number;
      info: { questionId: number; timeLeft: number };
    },
    @ConnectedSocket() socc: Socket,
  ) {
    try {
      const room = this.getRoom(data.gameId);
      const sockets = await this.server.to(room).fetchSockets();
      for (const socket of sockets) {
        const user: User = socket.data.user;
        if (user.id == data.userId) {
          return socket.emit('receive_info', data.info);
        }
      }
    } catch (error) {
      return socc.emit('error', error);
    }
  }

  @SubscribeMessage('get_students_statistics')
  async getStudentsStatistics(
    @MessageBody()
    data: { gameId: number },
    @ConnectedSocket() socc: Socket,
  ) {
    try {
      const studentsStatistics =
        await this.gameServerService.getStudentsStatistics(data.gameId);
      socc.emit('receive_students_statistics', studentsStatistics);
    } catch (error) {
      return socc.emit('error', error);
    }
  }
}
