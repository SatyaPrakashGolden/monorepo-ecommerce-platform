import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
export enum DeviceType {
  ANDROID = 'android',
  IOS = 'ios',
  WEB = 'web',
}


@Entity('user_fcm_tokens')
@Index(['token'], { unique: true })
export class UserFcmToken {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number; // no relation

  @Column({ name: 'token', type: 'varchar', length: 512 })
  token: string;

  @Column({ 
    name: 'device_type', 
    type: 'enum', 
    enum: DeviceType, 
    nullable: true 
  })
  deviceType?: DeviceType; // only ANDROID, IOS, WEB allowed

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
