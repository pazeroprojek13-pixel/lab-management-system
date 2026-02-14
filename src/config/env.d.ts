type NodeEnv = 'development' | 'production' | 'test';
interface EnvConfig {
    NODE_ENV: NodeEnv;
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
    CORS_ORIGIN: string;
    SMTP_HOST?: string;
    SMTP_PORT?: number;
    SMTP_SECURE: boolean;
    SMTP_USER?: string;
    SMTP_PASS?: string;
    SMTP_FROM?: string;
    ALERT_EMAIL_TO?: string;
    WHATSAPP_ENABLED: boolean;
    WHATSAPP_PROVIDER: 'noop' | 'webhook';
    WHATSAPP_WEBHOOK_URL?: string;
    WHATSAPP_TO?: string;
    CRON_SECRET?: string;
}
export declare const env: EnvConfig;
export {};
//# sourceMappingURL=env.d.ts.map