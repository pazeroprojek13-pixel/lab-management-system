export declare const appConfig: {
    env: any;
    isProduction: boolean;
    isDevelopment: boolean;
    port: any;
    corsOrigins: any;
    rateLimit: {
        windowMs: number;
        authMax: number;
        reportsMax: number;
    };
    jsonLimit: string;
    externalNotifications: {
        email: {
            enabled: boolean;
            smtpHost: any;
            smtpPort: any;
            smtpSecure: any;
            smtpUser: any;
            smtpPass: any;
            from: any;
            recipients: any;
        };
        whatsapp: {
            enabled: any;
            provider: any;
            webhookUrl: any;
            recipients: any;
        };
    };
    cron: {
        secret: any;
    };
};
//# sourceMappingURL=app.d.ts.map