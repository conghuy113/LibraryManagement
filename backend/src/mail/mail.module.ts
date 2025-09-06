import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST as string,
        secure: false,
        port: process.env.MAIL_PORT as string,
        auth: {
          user: process.env.MAIL_USERNAME as string,
          pass: process.env.MAIL_PASSWORD as string,
        },
      },
      defaults: {
        from: process.env.MAIL_FROM_ADDRESS as string,
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}