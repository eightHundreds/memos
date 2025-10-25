import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('shortcuts')
export class Shortcut {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  creatorId: number;

  @ManyToOne(() => User)
  creator: User;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  payload: string;

  @CreateDateColumn()
  createdTs: Date;

  @UpdateDateColumn()
  updatedTs: Date;

  @Column({ default: 0 })
  rowStatus: number;
}
