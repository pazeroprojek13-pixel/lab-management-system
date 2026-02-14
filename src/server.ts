import { appConfig } from './config/app';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';
import app from './app';

const server = app.listen(appConfig.port, () => {
  logger.info(
    {
      port: appConfig.port,
      env: appConfig.env,
      corsOrigins: appConfig.corsOrigins,
    },
    'Server started'
  );
});

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'Shutdown signal received');

  server.close(async (err?: Error) => {
    if (err) {
      logger.error({ err }, 'Error while closing HTTP server');
      process.exit(1);
      return;
    }

    try {
      await prisma.$disconnect();
      logger.info('Prisma disconnected');
      process.exit(0);
    } catch (disconnectError) {
      logger.error({ err: disconnectError }, 'Error while disconnecting Prisma');
      process.exit(1);
    }
  });
}

process.on('SIGTERM', () => {
  shutdown('SIGTERM').catch((error) => {
    logger.error({ err: error }, 'Unhandled shutdown error');
    process.exit(1);
  });
});

process.on('SIGINT', () => {
  shutdown('SIGINT').catch((error) => {
    logger.error({ err: error }, 'Unhandled shutdown error');
    process.exit(1);
  });
});
