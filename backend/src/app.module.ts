import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User, Memo } from './common/entities';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MemoModule } from './memo/memo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get('DATABASE_PATH') || 'memos.db',
        entities: [User, Memo],
        synchronize: true, // Set to false in production
        logging: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    MemoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
