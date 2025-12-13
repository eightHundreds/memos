import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('webhooks')
export class Webhook {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  creatorId: number;

  @ManyToOne(() => User)
  creator: User;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  url: string;

  @CreateDateColumn()
  createdTs: Date;

  @UpdateDateColumn()
  updatedTs: Date;

  @Column({ default: 0 })
  rowStatus: number;
}
