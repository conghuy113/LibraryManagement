import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from './../user/user.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User, app_name: string, url: string) {
    try {
      await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Library Website! Confirm your Email',
      template: './confirmation',
      context: {
        name: user.fullName,
        url,
        app_name,
      },
    });
    } catch (error) {
      console.error('Error sending Verify email:', error);
    }
  }

  async sendResetPasswordLink(email: string, url: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset password',
        template: 'reset_password',
        context: {
          name: email,
          url,
          app_name: 'Library Website',
        },
      });
    } catch (error) {
      console.error('Error sending Reset password email:', error);
    }
  }
}