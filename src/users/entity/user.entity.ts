import { Entity, PrimaryGeneratedColumn, Column, AfterInsert } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password?: string;

  @Column({ default: false })
  isActive: boolean;

@Column({ nullable: true })
  keycloakId: string;
}