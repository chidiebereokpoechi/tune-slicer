import * as winston from 'winston'
import { env } from './env'

const { combine, timestamp, cli } = winston.format

export const baseLogger = winston.createLogger({
    level: env.LOG_LEVEL,
    format: combine(timestamp(), cli()),
    transports: [new winston.transports.Console()],
})
