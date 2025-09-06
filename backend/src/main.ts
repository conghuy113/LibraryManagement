import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { configSwagger } from './configs/api-docs.config';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const logger = new Logger(bootstrap.name);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'default_secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 ngày
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: false
      }
    }),
  );
  configSwagger(app);
  const config_service = app.get(ConfigService);
  app.useStaticAssets(join(__dirname, './served'));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  
  const port = config_service.get<string | number>('PORT') ?? 3000;
  await app.listen(port, () =>
    logger.log(`Application running on port ${port}`),
  );
}
bootstrap();
