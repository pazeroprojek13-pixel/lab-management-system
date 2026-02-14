import { NotificationType } from '@prisma/client';
export interface ExternalNotificationPayload {
    type: NotificationType;
    campusId: string;
    entityId: string;
    message: string;
}
export declare class ExternalNotificationService {
    private readonly emailEnabled;
    private readonly whatsappEnabled;
    private readonly transporter;
    private readonly whatsappProvider;
    constructor();
    notifyAsync(payloads: ExternalNotificationPayload[]): void;
    private notify;
    private sendEmail;
    private sendWhatsApp;
}
export declare const externalNotificationService: ExternalNotificationService;
//# sourceMappingURL=external-notification.service.d.ts.map