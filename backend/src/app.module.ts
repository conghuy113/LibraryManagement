import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { database_config } from './configs/configuration.config';
import Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { BookModule } from './books/book.module';
import { HistoryModule } from './history/history.module';


@Module({
	imports: [
		ConfigModule.forRoot({
			validationSchema: Joi.object({
				NODE_ENV: Joi.string()
					.valid('development', 'production', 'test', 'provision')
					.default('development'),
				PORT: Joi.number().port().required(),
				DATABASE_USERNAME: Joi.string().min(4).required(),
				DATABASE_PASSWORD: Joi.string().min(4).required(),
				DATABASE_URI: Joi.string().required(),
			}),
			validationOptions: {
				abortEarly: false,
			},
			load: [database_config],
			isGlobal: true,
			cache: true,
			expandVariables: true,
			envFilePath: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env'
		}),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				uri: configService.get<string>('DATABASE_URI'),
				dbName: configService.get<string>('DATABASE_NAME'),
			}),
			inject: [ConfigService]
		}),
		UserModule,
		AuthModule,
		BookModule,
		HistoryModule
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
