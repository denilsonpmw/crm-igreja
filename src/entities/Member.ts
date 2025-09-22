import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('membros')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  membro_id!: string;

  @Column({ length: 255 })
  nome!: string;

  @Column({ length: 14, nullable: true })
  cpf?: string;

  @Column({ type: 'date', nullable: true })
  data_nascimento?: Date;

  @Column({ length: 20, nullable: true })
  telefone?: string;

  @Column({ type: 'uuid', nullable: true })
  congregacao_id?: string | null;

  @Column({ type: 'uuid', nullable: true })
  created_by?: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
