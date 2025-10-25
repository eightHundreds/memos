import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('attachment')
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  creatorId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column()
  filename: string;

  @Column()
  type: string;

  @Column()
  size: number;

  @Column({ nullable: true })
  path: string;

  @Column({ nullable: true })
  externalLink: string;

  @CreateDateColumn()
  createdTs: Date;

  @Column({ default: 'NORMAL' })
  rowStatus: string;
}
