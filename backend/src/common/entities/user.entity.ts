import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum Role {
  HOST = 'HOST',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum RowStatus {
  NORMAL = 'NORMAL',
  ARCHIVED = 'ARCHIVED',
}

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 20, default: Role.USER })
  role: Role;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nickname: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'avatar_url' })
  avatarUrl: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 20, default: RowStatus.NORMAL, name: 'row_status' })
  rowStatus: RowStatus;

  @CreateDateColumn({ type: 'bigint', name: 'created_ts' })
  createdTs: number;

  @UpdateDateColumn({ type: 'bigint', name: 'updated_ts' })
  updatedTs: number;
}
