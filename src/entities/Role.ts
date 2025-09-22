import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

interface Permission {
  resource: string;
  action: string; // create, read, update, delete or '*'
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  role_id!: string;

  @Column({ length: 100, unique: true })
  name!: string;

  @Column({ type: 'simple-json', default: '[]' })
  permissions!: Permission[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}

export type { Permission };
