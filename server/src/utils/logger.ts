import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from 'path';

const logDir = 'logs'

const {combine, timestamp, printf} = winston.format;

const logFormat = printf(({level, message, timestamp}) => {
    return `${timestamp} [${level}]: ${message}`;
});

const logger = winston.createLogger({
    // level: 'info',
    level: 'debug',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss'}),
        logFormat
    ),
    transports: [
        new winston.transports.Console(),
        new DailyRotateFile({
            dirname: path.join(process.cwd(), logDir),
            filename: '%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '7d',
        })
    ]
});

export default logger;