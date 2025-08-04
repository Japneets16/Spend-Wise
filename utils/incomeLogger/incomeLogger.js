const { createLogger, transports, format } = require('winston')
require('winston-mongodb')

// Create base transports array
const loggerTransports = [
    new transports.Console({
        level: "info",
        format: format.combine(format.timestamp(), format.json())
    }),
    new transports.Console({
        level: "error",
        format: format.combine(format.timestamp(), format.json())
    }),
    new transports.File({
        filename: 'logs/incomeLogger/incomeLogData.log',
        level: "info",
        maxsize: 5242880,
        format: format.combine(
            format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
            format.align(),
            format.printf(info => `level ${info.level}: ${info.timestamp} ${info.message}`)
        ),
    })
];

// Only add MongoDB transport if URL is provided
if (process.env.URL) {
    loggerTransports.push(
        new transports.MongoDB({
            level: "info",
            db: process.env.URL,
            options: {
                useUnifiedTopology: true,
            },
            collection: 'incomeLogData',
            format: format.combine(format.timestamp(), format.json())
        })
    );
}

const incomeLogger = createLogger({
    transports: loggerTransports
})

module.exports = incomeLogger
