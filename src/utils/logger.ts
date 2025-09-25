// Minimal logger wrapper so we can control console usage and silence linter warnings
export const logger = {
  info: (...args: unknown[]) => {
    // keep simple for now; can be upgraded to winston later
    // eslint-disable-next-line no-console
    console.log(...args);
  },
  warn: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.warn(...args);
  },
  error: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error(...args);
  }
};

export default logger;
