import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, SocketWithPayload } from '../types';
import { PollsService } from '../polls.service';
import extractTokenFromSocket from '../utils/extractToken';

@Injectable()
export class GatewayAdminGuard implements CanActivate {
  constructor(
    private readonly pollsService: PollsService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket: SocketWithPayload = context.switchToWs().getClient();
    const accessToken = extractTokenFromSocket(socket);

    if (!accessToken) {
      throw new UnauthorizedException('Missing access token');
    }

    try {
      const { pollID, sub } =
        await this.jwtService.verifyAsync<JwtPayload>(accessToken);

      const poll = await this.pollsService.findOne(pollID);

      if (poll.adminID !== sub) {
        throw new ForbiddenException('Admin privileges required');
      }

      return true;
    } catch (error) {
      throw new ForbiddenException('Admin privileges required');
    }
  }
}
