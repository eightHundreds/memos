import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User, Memo } from './common/entities';
import { UserAccessToken } from './user/entities/user-access-token.entity';
import { Shortcut } from './common/entities/shortcut.entity';
import { Webhook } from './common/entities/webhook.entity';
import { MemoComment } from './memo/entities/memo-comment.entity';
import { MemoReaction } from './memo/entities/memo-reaction.entity';
import { MemoTag } from './memo/entities/memo-tag.entity';
import { Inbox } from './common/entities/inbox.entity';
import { Activity } from './common/entities/activity.entity';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MemoModule } from './memo/memo.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { MarkdownModule } from './markdown/markdown.module';
import { ShortcutModule } from './shortcut/shortcut.module';
import { WebhookModule } from './webhook/webhook.module';
import { InboxModule } from './inbox/inbox.module';
import { ActivityModule } from './activity/activity.module';

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
        entities: [User, Memo, UserAccessToken, Shortcut, Webhook, MemoComment, MemoReaction, MemoTag, Inbox, Activity],
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
    InboxModule,
    ActivityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
