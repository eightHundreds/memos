import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  creatorId: number;

  @ManyToOne(() => User)
  creator: User;

  @Column({ type: 'varchar', length: 50 })
  type: string; // e.g., 'MEMO_CREATED', 'MEMO_UPDATED', 'USER_LOGGED_IN', etc.

  @Column({ type: 'varchar', length: 50 })
  level: string; // e.g., 'INFO', 'WARN', 'ERROR'

  @Column({ type: 'text', nullable: true })
  payload: string; // JSON string with additional data

  @CreateDateColumn()
  createdTs: Date;
}
