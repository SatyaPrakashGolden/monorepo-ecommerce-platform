import { EmailService } from './email.service';
export declare class EmailController {
    private readonly emailService;
    constructor(emailService: EmailService);
    handleSendEmail(message: any): Promise<{
        message: string;
    }>;
}
