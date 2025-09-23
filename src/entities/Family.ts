import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Congregacao } from './Congregacao';
import { Member } from './Member';

@Entity('familias')
export class Family {
  @PrimaryGeneratedColumn('uuid')
  familia_id!: string;

  @Column({ type: 'uuid' })
  congregacao_id!: string;

  @Column({ type: 'varchar', length: 255 })
  nome_familia!: string;

  @Column({ type: 'text', nullable: true })
  endereco?: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  cep?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cidade?: string | null;

  @Column({ type: 'varchar', length: 2, nullable: true })
  estado?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefone_principal?: string | null;

  @Column({ type: 'uuid', nullable: true })
  responsavel_id?: string | null; // ID do membro responsável pela família

  @Column({ type: 'text', nullable: true })
  observacoes?: string | null;

  @Column({ type: 'boolean', default: true })
  ativo!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relacionamentos
  @ManyToOne(() => Congregacao, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'congregacao_id' })
  congregacao!: Congregacao;

  @OneToMany(() => Member, member => member.familia)
  membros?: Member[];

  // Método para retornar dados básicos
  toBasicInfo() {
    return {
      familia_id: this.familia_id,
      nome_familia: this.nome_familia,
      endereco: this.endereco,
      cidade: this.cidade,
      estado: this.estado,
      telefone_principal: this.telefone_principal,
      total_membros: this.membros?.length || 0,
      responsavel_id: this.responsavel_id,
      ativo: this.ativo
    };
  }

  // Método para retornar dados completos
  toFullInfo() {
    return {
      ...this.toBasicInfo(),
      cep: this.cep,
      observacoes: this.observacoes,
      membros: this.membros?.map(m => ({
        membro_id: m.membro_id,
        nome: m.nome,
        data_nascimento: m.data_nascimento,
        sexo: m.sexo,
        status: m.status
      })) || [],
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}