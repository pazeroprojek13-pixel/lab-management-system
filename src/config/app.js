import { env } from './env';
const corsOrigins = env.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
export const appConfig = {
    env: env.NODE_ENV,
    isProduction: env.NODE_ENV === 'production',
    isDevelopment: env.NODE_ENV === 'development',
    port: env.PORT,
    corsOrigins,
    rateLimit: {
        windowMs: 15 * 60 * 1000,
        authMax: env.NODE_ENV === 'production' ? 100 : 1000,
        reportsMax: env.NODE_ENV === 'production' ? 300 : 2000,
    },
    jsonLimit: env.NODE_ENV === 'production' ? '1mb' : '2mb',
    externalNotifications: {
        email: {
            enabled: Boolean(env.SMTP_HOST &&
                env.SMTP_PORT &&
                env.SMTP_USER &&
                env.SMTP_PASS &&
                env.SMTP_FROM &&
                env.ALERT_EMAIL_TO),
            smtpHost: env.SMTP_HOST,
            smtpPort: env.SMTP_PORT,
            smtpSecure: env.SMTP_SECURE,
            smtpUser: env.SMTP_USER,
            smtpPass: env.SMTP_PASS,
            from: env.SMTP_FROM,
            recipients: env.ALERT_EMAIL_TO
                ? env.ALERT_EMAIL_TO.split(',').map((email) => email.trim()).filter(Boolean)
                : [],
        },
        whatsapp: {
            enabled: env.WHATSAPP_ENABLED,
            provider: env.WHATSAPP_PROVIDER,
            webhookUrl: env.WHATSAPP_WEBHOOK_URL,
            recipients: env.WHATSAPP_TO
                ? env.WHATSAPP_TO.split(',').map((phone) => phone.trim()).filter(Boolean)
                : [],
        },
    },
    cron: {
        secret: env.CRON_SECRET,
    },
};
//# sourceMappingURL=app.js.map