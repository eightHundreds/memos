import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum Visibility {
  PUBLIC = 'PUBLIC',
  PROTECTED = 'PROTECTED',
  PRIVATE = 'PRIVATE',
}

export enum RowStatus {
  NORMAL = 'NORMAL',
  ARCHIVED = 'ARCHIVED',
}

@Entity('memo')
export class Memo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  uid: string;

  @Column({ type: 'integer', name: 'creator_id' })
  creatorId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 20, default: Visibility.PRIVATE })
  visibility: Visibility;

  @Column({ type: 'boolean', default: false })
  pinned: boolean;

  @Column({ type: 'varchar', length: 20, default: RowStatus.NORMAL, name: 'row_status' })
  rowStatus: RowStatus;

  @Column({ type: 'integer', nullable: true, name: 'parent_id' })
  parentId: number;

  @CreateDateColumn({ type: 'bigint', name: 'created_ts' })
  createdTs: number;

  @UpdateDateColumn({ type: 'bigint', name: 'updated_ts' })
  updatedTs: number;
}
