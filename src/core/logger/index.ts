import pino from 'pino';

const fs = require('fs');

export const createLogger = (name, ...options) => pino({ name, ...options });

const logFile = fs.createWriteStream('./debug.log', { flags: 'a' });
export const fileLogger = (...logs): void => logs.forEach((log) => logFile.write(`${JSON.stringify(log)}\n`));
