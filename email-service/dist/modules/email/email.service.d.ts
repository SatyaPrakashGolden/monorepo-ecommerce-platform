import { ClientKafka } from '@nestjs/microservices';
export declare class EmailService {
    private readonly kafkaClient;
    private transporter;
    constructor(kafkaClient: ClientKafka);
    sendMail(to: string, subject: string, html: string): Promise<void>;
}
