import nodemailer from 'nodemailer';
import { appConfig } from '../config/app';
import { logger } from '../lib/logger';
class NoopWhatsAppProvider {
    async send(_payload) {
        return;
    }
}
class WebhookWhatsAppProvider {
    webhookUrl;
    recipients;
    constructor(webhookUrl, recipients) {
        this.webhookUrl = webhookUrl;
        this.recipients = recipients;
    }
    async send(payload) {
        const response = await fetch(this.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                recipients: this.recipients,
                type: payload.type,
                campusId: payload.campusId,
                entityId: payload.entityId,
                message: payload.message,
            }),
        });
        if (!response.ok) {
            throw new Error(`WhatsApp webhook returned ${response.status}`);
        }
    }
}
export class ExternalNotificationService {
    emailEnabled = appConfig.externalNotifications.email.enabled;
    whatsappEnabled = appConfig.externalNotifications.whatsapp.enabled &&
        appConfig.externalNotifications.whatsapp.provider === 'webhook' &&
        Boolean(appConfig.externalNotifications.whatsapp.webhookUrl) &&
        appConfig.externalNotifications.whatsapp.recipients.length > 0;
    transporter;
    whatsappProvider;
    constructor() {
        this.transporter = this.emailEnabled
            ? nodemailer.createTransport({
                host: appConfig.externalNotifications.email.smtpHost,
                port: appConfig.externalNotifications.email.smtpPort,
                secure: appConfig.externalNotifications.email.smtpSecure,
                auth: {
                    user: appConfig.externalNotifications.email.smtpUser,
                    pass: appConfig.externalNotifications.email.smtpPass,
                },
            })
            : null;
        this.whatsappProvider = this.whatsappEnabled
            ? new WebhookWhatsAppProvider(appConfig.externalNotifications.whatsapp.webhookUrl, appConfig.externalNotifications.whatsapp.recipients)
            : new NoopWhatsAppProvider();
    }
    notifyAsync(payloads) {
        if (payloads.length === 0)
            return;
        setImmediate(() => {
            this.notify(payloads).catch((error) => {
                logger.error({ err: error }, 'External notification dispatch failed');
            });
        });
    }
    async notify(payloads) {
        await Promise.all(payloads.map(async (payload) => {
            await Promise.all([
                this.sendEmail(payload).catch((error) => {
                    logger.error({ err: error, type: payload.type, entityId: payload.entityId }, 'Email notification failed');
                }),
                this.sendWhatsApp(payload).catch((error) => {
                    logger.error({ err: error, type: payload.type, entityId: payload.entityId }, 'WhatsApp notification failed');
                }),
            ]);
        }));
    }
    async sendEmail(payload) {
        if (!this.emailEnabled || !this.transporter)
            return;
        const subject = `[${payload.type}] Campus ${payload.campusId} - ${payload.entityId}`;
        await this.transporter.sendMail({
            from: appConfig.externalNotifications.email.from,
            to: appConfig.externalNotifications.email.recipients.join(','),
            subject,
            text: payload.message,
            html: `<p>${payload.message}</p>`,
        });
    }
    async sendWhatsApp(payload) {
        if (!this.whatsappEnabled)
            return;
        await this.whatsappProvider.send(payload);
    }
}
export const externalNotificationService = new ExternalNotificationService();
//# sourceMappingURL=external-notification.service.js.map