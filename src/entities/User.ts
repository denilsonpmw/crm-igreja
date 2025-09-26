import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn('uuid')
  usuario_id!: string;

  @Column({ length: 255 })
  nome!: string;

  @Column({ length: 255, unique: true })
  email!: string;

  @Column()
  senha_hash!: string;

  @Column({ type: 'jsonb', nullable: false, default: () => "'[]'::jsonb" })
  roles!: string[];

  @Column({ type: 'boolean', default: true })
  ativo!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
