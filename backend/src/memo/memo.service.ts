import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Memo, Visibility, RowStatus } from '../common/entities/memo.entity';
import { CreateMemoDto, UpdateMemoDto, QueryMemoDto } from './dto/memo.dto';
import { MemoComment } from './entities/memo-comment.entity';
import { MemoReaction } from './entities/memo-reaction.entity';
import { MemoTag } from './entities/memo-tag.entity';

@Injectable()
export class MemoService {
  constructor(
    @InjectRepository(Memo)
    private memoRepository: Repository<Memo>,
    @InjectRepository(MemoComment)
    private commentRepository: Repository<MemoComment>,
    @InjectRepository(MemoReaction)
    private reactionRepository: Repository<MemoReaction>,
    @InjectRepository(MemoTag)
    private tagRepository: Repository<MemoTag>,
  ) {}

  private generateUID(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async create(createMemoDto: CreateMemoDto, userId: number) {
    const memo = this.memoRepository.create({
      uid: this.generateUID(),
      content: createMemoDto.content,
      visibility: createMemoDto.visibility || Visibility.PRIVATE,
      pinned: createMemoDto.pinned || false,
      creatorId: userId,
      createdTs: Date.now(),
      updatedTs: Date.now(),
      rowStatus: RowStatus.NORMAL,
    });

    await this.memoRepository.save(memo);

    return memo;
  }

  async findAll(queryDto: QueryMemoDto, userId?: number) {
    const query = this.memoRepository.createQueryBuilder('memo');

    // If no user is authenticated, only show public memos
    if (!userId) {
      query.andWhere('memo.visibility = :visibility', { visibility: Visibility.PUBLIC });
    } else {
      // Show user's own memos and public memos
      query.andWhere(
        '(memo.creatorId = :userId OR memo.visibility = :visibility)',
        { userId, visibility: Visibility.PUBLIC }
      );
    }

    query.andWhere('memo.rowStatus = :rowStatus', { rowStatus: RowStatus.NORMAL });

    if (queryDto.visibility) {
      query.andWhere('memo.visibility = :visibility', { visibility: queryDto.visibility });
    }

    if (queryDto.creatorId) {
      query.andWhere('memo.creatorId = :creatorId', { creatorId: parseInt(queryDto.creatorId) });
    }

    query.orderBy('memo.pinned', 'DESC').addOrderBy('memo.createdTs', 'DESC');

    if (queryDto.limit) {
      query.limit(parseInt(queryDto.limit));
    }

    if (queryDto.offset) {
      query.offset(parseInt(queryDto.offset));
    }

    const memos = await query.getMany();

    return { memos };
  }

  async findOne(id: number, userId?: number) {
    const memo = await this.memoRepository.findOne({
      where: { id },
    });

    if (!memo) {
      throw new NotFoundException('Memo not found');
    }

    // Check visibility permissions
    if (!userId && memo.visibility !== Visibility.PUBLIC) {
      throw new ForbiddenException('Access denied');
    }

    if (userId && memo.creatorId !== userId && memo.visibility === Visibility.PRIVATE) {
      throw new ForbiddenException('Access denied');
    }

    return memo;
  }

  async update(id: number, updateMemoDto: UpdateMemoDto, userId: number) {
    const memo = await this.memoRepository.findOne({ where: { id } });

    if (!memo) {
      throw new NotFoundException('Memo not found');
    }

    if (memo.creatorId !== userId) {
      throw new ForbiddenException('You can only update your own memos');
    }

    if (updateMemoDto.content !== undefined) {
      memo.content = updateMemoDto.content;
    }

    if (updateMemoDto.visibility !== undefined) {
      memo.visibility = updateMemoDto.visibility;
    }

    if (updateMemoDto.pinned !== undefined) {
      memo.pinned = updateMemoDto.pinned;
    }

    memo.updatedTs = Date.now();

    await this.memoRepository.save(memo);

    return memo;
  }

  async delete(id: number, userId: number) {
    const memo = await this.memoRepository.findOne({ where: { id } });

    if (!memo) {
      throw new NotFoundException('Memo not found');
    }

    if (memo.creatorId !== userId) {
      throw new ForbiddenException('You can only delete your own memos');
    }

    // Soft delete by setting rowStatus to ARCHIVED
    memo.rowStatus = RowStatus.ARCHIVED;
    await this.memoRepository.save(memo);

    return { message: 'Memo deleted successfully' };
  }

  // Memo Comments
  async createComment(memoId: number, content: string, userId: number): Promise<MemoComment> {
    const memo = await this.findOne(memoId, userId);
    
    const comment = this.commentRepository.create({
      memoId: memo.id,
      creatorId: userId,
      content,
    });
    
    return this.commentRepository.save(comment);
  }

  async getComments(memoId: number, userId?: number): Promise<MemoComment[]> {
    await this.findOne(memoId, userId);
    
    return this.commentRepository.find({
      where: { memoId, rowStatus: 0 },
      order: { createdTs: 'DESC' },
    });
  }

  async deleteComment(commentId: number, userId: number): Promise<void> {
    const comment = await this.commentRepository.findOne({ where: { id: commentId } });
    
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    
    if (comment.creatorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }
    
    comment.rowStatus = 1;
    await this.commentRepository.save(comment);
  }

  // Memo Reactions
  async upsertReaction(memoId: number, reactionType: string, userId: number): Promise<MemoReaction> {
    const memo = await this.findOne(memoId, userId);
    
    let reaction = await this.reactionRepository.findOne({
      where: { memoId: memo.id, creatorId: userId, reactionType },
    });
    
    if (!reaction) {
      reaction = this.reactionRepository.create({
        memoId: memo.id,
        creatorId: userId,
        reactionType,
      });
      return this.reactionRepository.save(reaction);
    }
    
    return reaction;
  }

  async deleteReaction(memoId: number, reactionType: string, userId: number): Promise<void> {
    const reaction = await this.reactionRepository.findOne({
      where: { memoId, creatorId: userId, reactionType },
    });
    
    if (reaction) {
      await this.reactionRepository.remove(reaction);
    }
  }

  async getReactions(memoId: number, userId?: number): Promise<MemoReaction[]> {
    await this.findOne(memoId, userId);
    
    return this.reactionRepository.find({
      where: { memoId },
    });
  }

  // Memo Tags
  async renameTag(oldName: string, newName: string, userId: number): Promise<void> {
    const existingTag = await this.tagRepository.findOne({ where: { name: newName } });
    
    if (existingTag) {
      throw new BadRequestException('Tag with new name already exists');
    }
    
    const tag = await this.tagRepository.findOne({ where: { name: oldName } });
    
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    
    tag.name = newName;
    await this.tagRepository.save(tag);
  }

  async deleteTag(tagName: string, userId: number): Promise<void> {
    const tag = await this.tagRepository.findOne({ where: { name: tagName } });
    
    if (tag) {
      await this.tagRepository.remove(tag);
    }
  }

  async listTags(): Promise<MemoTag[]> {
    return this.tagRepository.find({
      order: { usageCount: 'DESC', name: 'ASC' },
    });
  }
}
