import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('identity_provider')
export class IdentityProvider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  type: string; // e.g., 'OAUTH2', 'LDAP'

  @Column({ nullable: true })
  identifierFilter: string;

  @Column('simple-json', { nullable: true })
  config: any;

  @CreateDateColumn()
  createdTs: Date;

  @UpdateDateColumn()
  updatedTs: Date;

  @Column({ default: 'NORMAL' })
  rowStatus: string;
}
