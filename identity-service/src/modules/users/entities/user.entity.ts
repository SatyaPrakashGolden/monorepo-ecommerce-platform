import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id: number;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName?: string;

  
  @Column({ name: 'email_id', type: 'varchar', length: 255, unique: true })
  emailId: string;

  
  @Column({ name: 'contact_no', type: 'varchar', length: 20, unique: true })
  contactNo: string;

  
  @Column({ name: 'unique_id', type: 'varchar', length: 50, unique: true })
  uniqueId: string;

  @Column({ name: 'address', type: 'varchar', length: 255, nullable: true })
  address?: string;

  @Column({ name: 'is_contact_verified', type: 'tinyint', nullable: true })
  isContactVerified?: boolean;

  @Column({ name: 'is_email_verified', type: 'tinyint', default: () => '0' })
  isEmailVerified: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt: Date;
}
