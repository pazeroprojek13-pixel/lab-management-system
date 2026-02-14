import dotenv from 'dotenv';
dotenv.config({ quiet: true });
function required(name) {
    const value = process.env[name];
    if (!value || value.trim() === '') {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value.trim();
}
function parseNodeEnv(value) {
    if (value === 'production' || value === 'test' || value === 'development') {
        return value;
    }
    return 'development';
}
function parsePort(value) {
    const fallback = 3000;
    if (!value)
        return fallback;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error('Invalid PORT value. PORT must be a positive integer.');
    }
    return parsed;
}
function optional(name) {
    const value = process.env[name];
    if (!value || value.trim() === '')
        return undefined;
    return value.trim();
}
function parseOptionalPort(name) {
    const raw = optional(name);
    if (!raw)
        return undefined;
    const parsed = Number(raw);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error(`Invalid ${name} value. Must be a positive integer.`);
    }
    return parsed;
}
function parseBoolean(value, fallback) {
    if (!value)
        return fallback;
    return value.toLowerCase() === 'true';
}
function loadEnv() {
    const NODE_ENV = parseNodeEnv(process.env.NODE_ENV);
    const PORT = parsePort(process.env.PORT);
    const DATABASE_URL = required('DATABASE_URL');
    const JWT_SECRET = required('JWT_SECRET');
    const CORS_ORIGIN = required('CORS_ORIGIN');
    const SMTP_HOST = optional('SMTP_HOST');
    const SMTP_PORT = parseOptionalPort('SMTP_PORT');
    const SMTP_SECURE = parseBoolean(process.env.SMTP_SECURE, false);
    const SMTP_USER = optional('SMTP_USER');
    const SMTP_PASS = optional('SMTP_PASS');
    const SMTP_FROM = optional('SMTP_FROM');
    const ALERT_EMAIL_TO = optional('ALERT_EMAIL_TO');
    const WHATSAPP_ENABLED = parseBoolean(process.env.WHATSAPP_ENABLED, false);
    const WHATSAPP_PROVIDER = process.env.WHATSAPP_PROVIDER === 'webhook' ? 'webhook' : 'noop';
    const WHATSAPP_WEBHOOK_URL = optional('WHATSAPP_WEBHOOK_URL');
    const WHATSAPP_TO = optional('WHATSAPP_TO');
    const CRON_SECRET = optional('CRON_SECRET');
    if (NODE_ENV === 'production') {
        // Keep accidental console.log noise out of production logs.
        console.log = () => undefined;
    }
    return {
        NODE_ENV,
        PORT,
        DATABASE_URL,
        JWT_SECRET,
        CORS_ORIGIN,
        SMTP_HOST,
        SMTP_PORT,
        SMTP_SECURE,
        SMTP_USER,
        SMTP_PASS,
        SMTP_FROM,
        ALERT_EMAIL_TO,
        WHATSAPP_ENABLED,
        WHATSAPP_PROVIDER,
        WHATSAPP_WEBHOOK_URL,
        WHATSAPP_TO,
        CRON_SECRET,
    };
}
export const env = loadEnv();
//# sourceMappingURL=env.js.map