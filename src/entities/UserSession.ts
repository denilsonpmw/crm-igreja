import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  session_id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  user_id!: string;

  @Column({ length: 255 })
  refresh_token_hash!: string;

  @Column({ type: 'simple-json', nullable: true })
  device_info?: any;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ip_address?: string;

  @Column({ type: 'datetime' })
  expires_at!: Date;

  @Column({ default: false })
  revoked!: boolean;

  @CreateDateColumn()
  created_at!: Date;
}
