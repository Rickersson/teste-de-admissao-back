import { SyncService } from 'src/sync/sync.service';
import { Entity, PrimaryGeneratedColumn, Column, AfterInsert } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  isActive: boolean;


}