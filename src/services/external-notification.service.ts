import { NotificationType } from '@prisma/client';
import nodemailer, { Transporter } from 'nodemailer';
import { appConfig } from '../config/app';
import { logger } from '../lib/logger';

export interface ExternalNotificationPayload {
  type: NotificationType;
  campusId: string;
  entityId: string;
  message: string;
}

interface WhatsAppProvider {
  send(payload: ExternalNotificationPayload): Promise<void>;
}

class NoopWhatsAppProvider implements WhatsAppProvider {
  async send(_payload: ExternalNotificationPayload): Promise<void> {
    return;
  }
}

class WebhookWhatsAppProvider implements WhatsAppProvider {
  constructor(
    private readonly webhookUrl: string,
    private readonly recipients: string[]
  ) {}

  async send(payload: ExternalNotificationPayload): Promise<void> {
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
  private readonly emailEnabled = appConfig.externalNotifications.email.enabled;
  private readonly whatsappEnabled =
    appConfig.externalNotifications.whatsapp.enabled &&
    appConfig.externalNotifications.whatsapp.provider === 'webhook' &&
    Boolean(appConfig.externalNotifications.whatsapp.webhookUrl) &&
    appConfig.externalNotifications.whatsapp.recipients.length > 0;
  private readonly transporter: Transporter | null;
  private readonly whatsappProvider: WhatsAppProvider;

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
      ? new WebhookWhatsAppProvider(
          appConfig.externalNotifications.whatsapp.webhookUrl!,
          appConfig.externalNotifications.whatsapp.recipients
        )
      : new NoopWhatsAppProvider();
  }

  notifyAsync(payloads: ExternalNotificationPayload[]): void {
    if (payloads.length === 0) return;

    setImmediate(() => {
      this.notify(payloads).catch((error) => {
        logger.error({ err: error }, 'External notification dispatch failed');
      });
    });
  }

  private async notify(payloads: ExternalNotificationPayload[]): Promise<void> {
    await Promise.all(
      payloads.map(async (payload) => {
        await Promise.all([
          this.sendEmail(payload).catch((error) => {
            logger.error(
              { err: error, type: payload.type, entityId: payload.entityId },
              'Email notification failed'
            );
          }),
          this.sendWhatsApp(payload).catch((error) => {
            logger.error(
              { err: error, type: payload.type, entityId: payload.entityId },
              'WhatsApp notification failed'
            );
          }),
        ]);
      })
    );
  }

  private async sendEmail(payload: ExternalNotificationPayload): Promise<void> {
    if (!this.emailEnabled || !this.transporter) return;

    const subject = `[${payload.type}] Campus ${payload.campusId} - ${payload.entityId}`;
    await this.transporter.sendMail({
      from: appConfig.externalNotifications.email.from,
      to: appConfig.externalNotifications.email.recipients.join(','),
      subject,
      text: payload.message,
      html: `<p>${payload.message}</p>`,
    });
  }

  private async sendWhatsApp(payload: ExternalNotificationPayload): Promise<void> {
    if (!this.whatsappEnabled) return;
    await this.whatsappProvider.send(payload);
  }
}

export const externalNotificationService = new ExternalNotificationService();
