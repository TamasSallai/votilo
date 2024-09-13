import { WsException } from '@nestjs/websockets';

type WsExceptionType = 'BadRequest' | 'Unauthorized' | 'Forbidden' | 'Unknown';

export class WsExtendedException extends WsException {
  readonly type: WsExceptionType;
  constructor(type: WsExceptionType, message: string | unknown) {
    super({ type, message });
    this.type = type;
  }
}

export class WsBadRequestException extends WsExtendedException {
  constructor(message: string | unknown) {
    super('BadRequest', message);
  }
}

export class WsUnauthorizedException extends WsExtendedException {
  constructor(message: string | unknown) {
    super('Unauthorized', message);
  }
}

export class WsForbiddenException extends WsExtendedException {
  constructor(message: string | unknown) {
    super('Forbidden', message);
  }
}

export class WsUnknownException extends WsExtendedException {
  constructor(message: string | unknown) {
    super('Unknown', message);
  }
}
