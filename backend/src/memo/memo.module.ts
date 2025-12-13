import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemoService } from './memo.service';
import { MemoController } from './memo.controller';
import { Memo } from '../common/entities';
import { MemoComment } from './entities/memo-comment.entity';
import { MemoReaction } from './entities/memo-reaction.entity';
import { MemoTag } from './entities/memo-tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Memo, MemoComment, MemoReaction, MemoTag])],
  controllers: [MemoController],
  providers: [MemoService],
  exports: [MemoService],
})
export class MemoModule {}
