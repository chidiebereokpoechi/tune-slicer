import * as winston from 'winston'

const { combine, timestamp, prettyPrint, colorize, align } = winston.format

export const baseLogger = winston.createLogger({
    level: process.env.LOG_LEVEL,
    transports: [
        new winston.transports.Console({
            format: combine(timestamp(), prettyPrint(), colorize(), align()),
        }),
        new winston.transports.File({
            filename: 'combined.log',
            format: combine(timestamp(), prettyPrint(), align()),
        }),
        new winston.transports.File({
            filename: 'errors.log',
            level: 'error',
            format: combine(timestamp(), prettyPrint(), align()),
        }),
    ],
})
