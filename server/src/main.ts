import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Main');

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const FRONTEND_URL = configService.get('FRONTEND_URL');
  app.enableCors({ origin: FRONTEND_URL });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.useWebSocketAdapter(new IoAdapter(app));

  const PORT = parseInt(configService.get('PORT'));
  await app.listen(PORT);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
