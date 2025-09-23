import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('congregacoes')
export class Congregacao {
  @PrimaryGeneratedColumn('uuid')
  congregacao_id!: string;

  @Column({ length: 255 })
  nome!: string;

  @Column({ type: 'text', nullable: true })
  endereco?: string;

  @Column({ length: 20, nullable: true })
  telefone?: string;

  @Column({ length: 255, nullable: true })
  email?: string;

  @Column({ length: 255, nullable: true })
  website?: string;

  @Column({ length: 20, nullable: true })
  cnpj?: string;

  @Column({ length: 255, nullable: true })
  pastor_principal?: string;

  @Column({ default: 'basico', length: 50 })
  plano!: string;

  @Column({ type: 'integer', default: 100 })
  limite_membros!: number;

  @Column({ type: 'integer', default: 500 })
  limite_storage_mb!: number;

  @Column({ type: 'integer', default: 1000 })
  limite_mensagens_mes!: number;

  @Column({ type: 'boolean', default: true })
  ativo!: boolean;

  @Column({ type: 'date', nullable: true })
  data_fundacao?: Date;

  @Column({ type: 'text', nullable: true })
  logo_url?: string;

  @Column({ type: 'simple-json', nullable: true })
  configuracoes?: Record<string, any>;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
