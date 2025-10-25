import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, Unique } from 'typeorm';
import { Memo } from '../../common/entities/memo.entity';
import { User } from '../../common/entities/user.entity';

@Entity('memo_reactions')
@Unique(['memoId', 'creatorId', 'reactionType'])
export class MemoReaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  memoId: number;

  @ManyToOne(() => Memo)
  memo: Memo;

  @Column()
  creatorId: number;

  @ManyToOne(() => User)
  creator: User;

  @Column({ type: 'varchar', length: 50 })
  reactionType: string; // e.g., 'THUMBS_UP', 'HEART', etc.

  @CreateDateColumn()
  createdTs: Date;
}
