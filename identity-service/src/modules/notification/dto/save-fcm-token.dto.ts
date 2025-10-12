// src/modules/notification/dto/save-fcm-token.dto.ts
import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { DeviceType } from '../entity/user.fcm.entity';

export class SaveFcmTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsEnum(DeviceType)
  deviceType: DeviceType;
}