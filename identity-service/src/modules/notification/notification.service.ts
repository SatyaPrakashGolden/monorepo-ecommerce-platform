import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFcmToken, DeviceType } from './entity/user.fcm.entity';
import { SaveFcmTokenDto } from './dto/save-fcm-token.dto';
import { User } from '../users/entities/user.entity';
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private firebaseApp: admin.app.App;

  constructor(
    private configService: ConfigService,
    @InjectRepository(UserFcmToken)
    private readonly userFcmTokenRepository: Repository<UserFcmToken>,
  ) {
    this.firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
        privateKey: configService
          .get<string>('FIREBASE_PRIVATE_KEY')
          ?.replace(/\\n/g, '\n'),
        clientEmail: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
      }),
    });
  }


async saveOrUpdateFcmToken(userId: number, dto: SaveFcmTokenDto) {
  const { token, deviceType } = dto;


  await this.userFcmTokenRepository
    .createQueryBuilder()
    .update(UserFcmToken)
    .set({ isActive: false })
    .where('user_id = :userId AND device_type = :deviceType', { userId, deviceType })
    .andWhere('token != :token', { token })
    .execute();

  // Check if token already exists
  const existingToken = await this.userFcmTokenRepository.findOne({ where: { token } });

  if (!existingToken) {
    const newToken = this.userFcmTokenRepository.create({
      token,
      deviceType,
      user: { id: userId } as User,  // ✅ Cast to full User type
      isActive: true,
    });
    await this.userFcmTokenRepository.save(newToken);
    this.logger.log(`New FCM token saved for user ${userId}`);
  } else {
    // Optional: Warn on reassignment (add null check for safety)
    if (existingToken.user?.id !== userId) {
      this.logger.warn(`Reassigning token ${token} from user ${existingToken.user?.id} to ${userId}`);
    }
    existingToken.user = { id: userId } as User;  // ✅ Cast to full User type
    existingToken.deviceType = deviceType;
    existingToken.isActive = true;
    await this.userFcmTokenRepository.save(existingToken);
    this.logger.log(`FCM token updated for user ${userId}`);
  }

  return { message: 'FCM token saved/updated successfully' };
}


async sendPushNotification(
    deviceToken: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    const message: admin.messaging.Message = {
      token: deviceToken,
      notification: { title, body },
      data: data || {},
    };

    try {
      const response = await this.firebaseApp.messaging().send(message); // Use app-specific for clarity
      this.logger.log(`Successfully sent message: ${response}`);
      return response;
    } catch (error) {
      this.logger.error(`Error sending message: ${error}`);
      throw error;
    }
  }


}