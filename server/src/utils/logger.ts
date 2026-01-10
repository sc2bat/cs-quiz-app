import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const logDir = 'logs'

const {combine, timestamp, printf, splat} = winston.format;

const logFormat = printf(({level, message, timestamp, ...meta}) => {
    if (typeof message === 'object') {
        message = JSON.stringify(message, null, 2);
    }

    let extra = '';
    if (Object.keys(meta).length > 0) {
        extra = '\n' + JSON.stringify(meta, null, 2);
    }
    return `${timestamp} [${level}]: ${message}${extra}`;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss'}),
        splat(),
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