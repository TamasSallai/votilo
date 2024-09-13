import {
  Logger,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Namespace } from 'socket.io';
import { JwtPayload, SocketWithPayload } from './types';
import { GatewayAdminGuard } from './guards/gateway-admin.guard';
import { PollsService } from './polls.service';
import extractTokenFromSocket from './utils/extractToken';
import { NominationDto } from './dto/nomination.dto';
import { WsExceptionsFilter } from 'src/exceptions/ws-exceptions.filter';
import { RemoveParticipantDto } from './dto/remove-participant.dto';
import { RemoveNominationDto } from './dto/remove-nomination.dto';

@UsePipes(new ValidationPipe())
@UseFilters(new WsExceptionsFilter())
@WebSocketGateway({ namespace: 'polls' })
export class PollsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger = new Logger(PollsGateway.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly pollsService: PollsService,
  ) {}

  private async authMiddleware(
    socket: SocketWithPayload,
    next: (err?: any) => void,
  ) {
    this.logger.debug(`Validating auth token before connection`);

    const accessToken = extractTokenFromSocket(socket);

    if (!accessToken) {
      return next(new WsException('Missing access token'));
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(accessToken);

      socket.payload = payload;
      return next();
    } catch (error) {
      return next(new WsException('Invalid access token'));
    }
  }

  afterInit(server: Server) {
    this.logger.log('PollsGateway initialized');
    server.use((socket, next) => this.authMiddleware(socket, next));
  }

  @WebSocketServer() io: Namespace;

  async handleConnection(socket: SocketWithPayload) {
    const payload = socket.payload;

    await socket.join(payload.pollID);

    const connectedClients =
      this.io.adapter.rooms?.get(payload.pollID)?.size ?? 0;

    this.logger.debug(
      `User with id: ${payload.sub} connected to room: ${payload.pollID}`,
    );

    this.logger.debug(`Total connected clients: ${connectedClients}`);

    const updatedPoll = await this.pollsService.addParticipant({
      pollID: payload.pollID,
      userID: payload.sub,
      name: payload.name,
    });

    this.io.to(payload.pollID).emit('poll_updated', updatedPoll);
  }

  async handleDisconnect(socket: SocketWithPayload) {
    const payload = socket.payload;

    const connectedClients =
      this.io.adapter.rooms?.get(payload.pollID)?.size ?? 0;

    this.logger.debug(
      `User with id: ${payload.sub} disconnected from room: ${payload.pollID}`,
    );

    this.logger.debug(`Total connected clients: ${connectedClients}`);

    const updatedPoll = await this.pollsService.removeParticipant({
      pollID: payload.pollID,
      userID: payload.sub,
    });

    this.io.to(payload.pollID).emit('poll_updated', updatedPoll);
  }

  @SubscribeMessage('nominate')
  async nominate(
    @MessageBody() dto: NominationDto,
    @ConnectedSocket() socket: SocketWithPayload,
  ) {
    const payload = socket.payload;

    const updatedPoll = await this.pollsService.addNomination({
      pollID: payload.pollID,
      userID: payload.sub,
      text: dto.text,
    });

    this.io.to(payload.pollID).emit('poll_updated', updatedPoll);
  }

  @UseGuards(GatewayAdminGuard)
  @SubscribeMessage('remove_participant')
  async removeParticipant(
    @MessageBody() dto: RemoveParticipantDto,
    @ConnectedSocket() socket: SocketWithPayload,
  ) {
    const payload = socket.payload;

    const updatedPoll = await this.pollsService.removeParticipant({
      pollID: payload.pollID,
      userID: dto.id,
    });

    this.io.to(payload.pollID).emit('poll_updated', updatedPoll);
  }

  @UseGuards(GatewayAdminGuard)
  @SubscribeMessage('remove_nomination')
  async removeNomination(
    @MessageBody() dto: RemoveNominationDto,
    @ConnectedSocket() socket: SocketWithPayload,
  ) {
    const payload = socket.payload;

    const updatedPoll = await this.pollsService.removeNomination({
      pollID: payload.pollID,
      nominationID: dto.id,
    });

    console.log(updatedPoll);

    this.io.to(payload.pollID).emit('poll_updated', updatedPoll);
  }

  @UseGuards(GatewayAdminGuard)
  @SubscribeMessage('start_poll')
  async startPoll(@ConnectedSocket() socket: SocketWithPayload) {
    const payload = socket.payload;

    const updatedPoll = await this.pollsService.startPoll(payload.pollID);

    this.io.to(payload.pollID).emit('poll_updated', updatedPoll);
  }

  @UseGuards(GatewayAdminGuard)
  @SubscribeMessage('close_poll')
  async closePoll(@ConnectedSocket() socket: SocketWithPayload) {
    const payload = socket.payload;

    const updatedPoll = await this.pollsService.getResults(payload.pollID);

    this.io.to(payload.pollID).emit('poll_updated', updatedPoll);
  }

  @SubscribeMessage('submit_rankings')
  async submitRankings(
    @ConnectedSocket() socket: SocketWithPayload,
    @MessageBody('rankings') rankings: string[],
  ) {
    const payload = socket.payload;

    const updatedPoll = await this.pollsService.addRankings({
      pollID: payload.pollID,
      userID: payload.sub,
      rankings,
    });

    this.io.to(payload.pollID).emit('poll_updated', updatedPoll);
  }
}
