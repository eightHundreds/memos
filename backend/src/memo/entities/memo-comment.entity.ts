import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Memo } from '../../common/entities/memo.entity';
import { User } from '../../common/entities/user.entity';

@Entity('memo_comments')
export class MemoComment {
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

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdTs: Date;

  @Column({ default: 0 })
  rowStatus: number;
}
