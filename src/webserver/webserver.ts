import express from 'express'
import { info } from '../logger.js'


export const app = express()
app.use(express.json())

const HTTP_HOST = process.env.HTTP_HOST || '::1'
const HTTP_PORT = parseInt(process.env.HTTP_PORT || '3030')

app.listen(HTTP_PORT, HTTP_HOST, () => {
    info(`HTTP Webserver is listening on http://${HTTP_HOST}:${HTTP_PORT}`)
})