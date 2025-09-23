import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Congregacao } from './Congregacao';
import { Family } from './Family';

@Entity('membros')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  membro_id!: string;

  @Column({ type: 'uuid', nullable: true })
  congregacao_id?: string | null;

  @Column({ type: 'uuid', nullable: true })
  familia_id?: string | null;

  @Column({ length: 255 })
  nome!: string;

  @Column({ length: 14, nullable: true })
  cpf?: string;

  @Column({ type: 'date', nullable: true })
  data_nascimento?: Date;

  @Column({ length: 1, nullable: true })
  sexo?: 'M' | 'F';

  @Column({ length: 20, nullable: true })
  estado_civil?: string;

  @Column({ length: 100, nullable: true })
  profissao?: string;

  @Column({ length: 20, nullable: true })
  telefone?: string;

  @Column({ length: 255, nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  endereco?: string;

  @Column({ length: 10, nullable: true })
  cep?: string;

  @Column({ length: 100, nullable: true })
  cidade?: string;

  @Column({ length: 2, nullable: true })
  estado?: string;

  @Column({ type: 'date', nullable: true })
  data_conversao?: Date;

  @Column({ type: 'date', nullable: true })
  data_batismo?: Date;

  @Column({ length: 20, default: 'ativo' })
  status!: string;

  @Column({ type: 'text', array: true, nullable: true })
  ministerios?: string[];

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @Column({ type: 'text', nullable: true })
  foto_url?: string;

  @Column({ type: 'uuid', nullable: true })
  created_by?: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relacionamentos
  @ManyToOne(() => Congregacao, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'congregacao_id' })
  congregacao?: Congregacao;

  @ManyToOne(() => Family, familia => familia.membros, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'familia_id' })
  familia?: Family;
}
