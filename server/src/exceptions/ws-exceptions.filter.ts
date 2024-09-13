import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import {
  WsUnknownException,
  WsExtendedException,
  WsBadRequestException,
  WsUnauthorizedException,
  WsForbiddenException,
} from './ws-exceptions';

@Catch()
export class WsExceptionsFilter implements ExceptionFilter {
  catch(exception: WsException | HttpException, host: ArgumentsHost) {
    const socket: Socket = host.switchToWs().getClient();
    if (exception instanceof HttpException) {
      const exceptionData = exception.getResponse();
      const exceptionMessage = exceptionData['message'];

      let wsException: WsExtendedException;

      if (exception instanceof BadRequestException) {
        wsException = new WsBadRequestException(exceptionMessage);
      }

      if (exception instanceof UnauthorizedException) {
        wsException = new WsUnauthorizedException(exceptionMessage);
      }

      if (exception instanceof ForbiddenException) {
        wsException = new WsForbiddenException(exceptionMessage);
      }

      socket.emit('exception', wsException.getError());
      return;
    }

    if (exception instanceof WsExtendedException) {
      socket.emit('exception', exception.getError());
      return;
    }

    const wsException = new WsUnknownException(exception.message);
    socket.emit('exception', wsException.getError());
  }
}
