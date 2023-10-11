import {createLogger as winstonCreateLogger, format, transports, Logger} from 'winston';
const {combine, timestamp, label, printf} = format;

interface LoggerOptions {
    level: string;
    message: string;
    label: string;
    timestamp: string;
}

const createLogger = (
    name: string,
    level: string,
    parentLogger?: Logger
) => {
    if (parentLogger) {
        /** @ts-ignore-next-line */
        name = `${parentLogger["__name"]}/${name}`;
    }

    /** @ts-ignore-next-line */
    const customFormat = printf(({level, message, label, timestamp}: LoggerOptions) => {
        return `${timestamp} [${label}] ${level.toUpperCase()}: ${message}`;
    });

    const logger = winstonCreateLogger({
        level: level,
        format: combine(
            label({label: name}),
            timestamp(),
            customFormat
        ),
        transports: [new transports.Console()]
    });

    /** @ts-ignore-next-line */
    logger["__name"] = name;

    return logger;
};

export {
    createLogger,
    Logger
};
