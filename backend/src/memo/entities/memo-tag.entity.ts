import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('memo_tags')
@Unique(['name'])
export class MemoTag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ default: 0 })
  usageCount: number;
}
