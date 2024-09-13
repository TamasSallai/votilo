import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PollsService } from './polls.service';
import { PollsGateway } from './polls.gateway';
import { PollsController } from './polls.controller';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    ConfigModule,
    RedisModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: parseInt(configService.get('JWT_TTL')),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [PollsService, PollsGateway],
  controllers: [PollsController],
})
export class PollsModule {}
