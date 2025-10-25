import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InboxService } from './inbox.service';
import { InboxController } from './inbox.controller';
import { Inbox } from '../common/entities/inbox.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inbox])],
  controllers: [InboxController],
  providers: [InboxService],
  exports: [InboxService],
})
export class InboxModule {}
