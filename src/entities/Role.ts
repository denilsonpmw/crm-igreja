import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

interface Permission {
  resource: string;
  action: string; // create, read, update, delete or '*'
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100, unique: true })
  name!: string;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  permissions!: Permission[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}

export type { Permission };
