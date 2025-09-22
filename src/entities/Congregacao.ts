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

  @Column({ default: 'basico' })
  plano!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
