// import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
// import {User} from '../../users/entities/user.entity'
// export enum DeviceType {
//   ANDROID = 'android',
//   IOS = 'ios',
//   WEB = 'web',
// }


// @Entity('user_fcm_tokens')
// @Index(['token'], { unique: true })
// export class UserFcmToken {
//   @PrimaryGeneratedColumn({ name: 'id' })
//   id: number;

//   @Column({ name: 'user_id', type: 'int' })
//   userId: number; // no relation

//   @Column({ name: 'token', type: 'varchar', length: 512 })
//   token: string;

//   @Column({ 
//     name: 'device_type', 
//     type: 'enum', 
//     enum: DeviceType, 
//     nullable: true 
//   })
//   deviceType?: DeviceType; // only ANDROID, IOS, WEB allowed

//   @Column({ name: 'is_active', type: 'boolean', default: true })
//   isActive: boolean;

//   @CreateDateColumn({ name: 'created_at' })
//   createdAt: Date;

//   @UpdateDateColumn({ name: 'updated_at' })
//   updatedAt: Date;
// }

// src/modules/notification/entity/user.fcm.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

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

  @Column({ name: 'token', type: 'varchar', length: 512 })
  token: string;

  @Column({
    name: 'device_type',
    type: 'enum',
    enum: DeviceType,
    nullable: true,
  })
  deviceType?: DeviceType;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.fcmTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
