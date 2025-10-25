import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

export enum InboxStatus {
  UNREAD = 'UNREAD',
  ARCHIVED = 'ARCHIVED',
}

@Entity('inbox')
export class Inbox {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  receiverId: number;

  @ManyToOne(() => User)
  receiver: User;

  @Column({ type: 'varchar', length: 50 })
  type: string; // e.g., 'MEMO_COMMENT', 'MEMO_MENTION', etc.

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'text', nullable: true })
  link: string;

  @Column({
    type: 'varchar',
    enum: InboxStatus,
    default: InboxStatus.UNREAD,
  })
  status: InboxStatus;

  @CreateDateColumn()
  createdTs: Date;
}
