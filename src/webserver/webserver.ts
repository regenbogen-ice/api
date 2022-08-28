import express, { NextFunction, Request, Response } from 'express'
import { error, info } from '../logger.js'
import cors from 'cors'
import { RegenbogenICEError } from '../errors.js'
import { randomBytes } from 'crypto'
import Sentry from '@sentry/node'
import { apolloServer } from '../graphql/server.js'


export const app = express()

if (process.env.SENTRY_DSN) {
    Sentry.init({ dsn: process.env.SENTRY_DSN })
    Sentry.setTag('environment', process.env.ENVIRONMENT || 'unknown')
    app.use(Sentry.Handlers.requestHandler())
}

apolloServer.applyMiddleware({ app })
app.use(express.json())
app.use(cors())

const HTTP_HOST = process.env.HTTP_HOST || '::1'
const HTTP_PORT = parseInt(process.env.HTTP_PORT || '3030')

export const start = () => {
    if (process.env.SENTRY_DSN)
        app.use(Sentry.Handlers.errorHandler());
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
        if (res.headersSent) {
            return next(err)
        }
        if (err instanceof RegenbogenICEError) {
            res.status(err.status_code).json(err.buildJSON())
        } else {
            const errorCode = randomBytes(16).toString('hex')
            res.status(500).json({ error: 'Internal server error.', error_code: errorCode })
            error(`Error while request to ${req.method} ${req.path}. Error code: ${errorCode}: ${err}`)
            if (err.hasOwnProperty('stack')) {
                console.error(`Stacktrace for error ${errorCode}: ${err}`)
                console.error(err.stack)
            }
        }
    })
    app.listen(HTTP_PORT, HTTP_HOST, () => {
        info(`HTTP Webserver is listening on http://${HTTP_HOST}:${HTTP_PORT}`)
    })
}