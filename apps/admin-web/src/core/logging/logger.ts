export const logger = {
  error(message: string, context?: Record<string, unknown>) {
    console.error(message, context);
  },
  info(message: string, context?: Record<string, unknown>) {
    console.info(message, context);
  },
};
