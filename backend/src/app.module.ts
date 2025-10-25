import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User, Memo } from './common/entities';
import { UserAccessToken } from './user/entities/user-access-token.entity';
import { Shortcut } from './common/entities/shortcut.entity';
import { Webhook } from './common/entities/webhook.entity';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MemoModule } from './memo/memo.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { MarkdownModule } from './markdown/markdown.module';
import { ShortcutModule } from './shortcut/shortcut.module';
import { WebhookModule } from './webhook/webhook.module';

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
        entities: [User, Memo, UserAccessToken, Shortcut, Webhook],
        synchronize: true, // Set to false in production
        logging: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    MemoModule,
    WorkspaceModule,
    MarkdownModule,
    ShortcutModule,
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
