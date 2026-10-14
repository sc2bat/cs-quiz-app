const isProduction = import.meta.env.PROD;
const appMode = isProduction ? 'PRD' : 'DEV';

const logger = {
  debug: (...args: unknown[]) => {
    if (!isProduction) {
      console.log(`%c[DEBUG] [${appMode}]`, 'color: #bada55; font-weight: bold;', ...args);
    }
  },
  info: (...args: unknown[]) => {
    console.info(`%c[INFO] [${appMode}]`, 'color: #646cff; font-weight: bold;', ...args);
  },
  warn: (...args: unknown[]) => {
    if (!isProduction) {
      console.warn(`[WARN] [${appMode}]`, ...args);
    }
  },
  error: (...args: unknown[]) => {
    console.error(`[ERROR] [${appMode}]`, ...args);
  },
};

export default logger;
