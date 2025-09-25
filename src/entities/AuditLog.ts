import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  user_id?: string | null;

  @Column({ type: 'uuid', nullable: true })
  congregacao_id?: string | null;

  @Column({ length: 50 })
  action!: string;

  @Column({ length: 50 })
  resource_type!: string;

  @Column({ type: 'uuid', nullable: true })
  resource_id?: string | null;

  @Column({ type: 'json', nullable: true })
  old_values?: unknown | null;

  @Column({ type: 'json', nullable: true })
  new_values?: unknown | null;

  @Column({ nullable: true })
  ip_address?: string;

  @Column({ type: 'text', nullable: true })
  user_agent?: string;

  @Column({ type: 'uuid', nullable: true })
  session_id?: string | null;

  @Column({ type: 'boolean', default: true })
  success!: boolean;

  @Column({ type: 'text', nullable: true })
  error_message?: string | null;

  @CreateDateColumn()
  created_at!: Date;
}
