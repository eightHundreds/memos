import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../common/entities/user.entity';

@Entity('user_access_token')
export class UserAccessToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  token: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @CreateDateColumn({ type: 'bigint', name: 'created_ts' })
  createdTs: number;

  @Column({ type: 'bigint', nullable: true, name: 'expires_ts' })
  expiresTs: number | null;
}
