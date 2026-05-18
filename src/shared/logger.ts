import { createLogger, format, transports } from 'winston';
import env from '../config/env.js';

const { combine, timestamp, colorize, printf, json } = format;

// Custom format for development — human readable
const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ level, message, timestamp, ...meta }) => {
    const extras = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : '';
    return `[${timestamp}] ${level}: ${message} ${extras}`;
  }),
);

// JSON format for production — machine readable
const prodFormat = combine(timestamp(), json());

const logger = createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [new transports.Console()],
});

export default logger;
