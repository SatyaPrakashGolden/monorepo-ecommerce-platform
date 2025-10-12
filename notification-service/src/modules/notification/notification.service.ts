import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationService {
  private firebaseApp: admin.app.App;

  constructor(private configService: ConfigService) {
    this.firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
        privateKey: configService
          .get<string>('FIREBASE_PRIVATE_KEY')
          ?.replace(/\\n/g, '\n'), // Important: convert \n to actual newlines
        clientEmail: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
      }),
    });
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
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}
