import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
});

export const reportError = (error: unknown) => {
  Sentry.captureException(error);
};