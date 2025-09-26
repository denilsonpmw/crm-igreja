import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn
} from 'typeorm';
// import { Congregacao } from './Congregacao';
// import { User } from './User';

@Entity('anexos')
export class Anexo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  congregacao_id!: string;

  @Column({ type: 'varchar', length: 50 })
  entity_type!: string;

  @Column({ type: 'uuid' })
  entity_id!: string;

  @Column({ type: 'varchar', length: 255 })
  file_name!: string;

  @Column({ type: 'text' })
  file_path!: string;

  @Column({ type: 'bigint' })
  file_size!: number;

  @Column({ type: 'varchar', length: 100 })
  mime_type!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  checksum?: string;

  @Column({ type: 'uuid', nullable: true })
  uploaded_by?: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  virus_scan_status!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  virus_scan_result?: string;

  @CreateDateColumn()
  created_at!: Date;
}
