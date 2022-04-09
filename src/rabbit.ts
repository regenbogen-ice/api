import { Rabbit } from 'rabbit-queue'
import { info, error, log } from './logger.js'

export const rabbit = new Rabbit(process.env.RABBIT_URL || 'amqp://localhost')


rabbit.on('connected', () => {
    info(`Rabbit connected.`)
})

rabbit.on('disconnect', (err = new Error(`Rabbitmq disconnected.`)) => {
    error(`Disconnected from rabbit: ${err}. Trying to reconnect.`)
    setTimeout(() => rabbit.reconnect(), 100)
})

rabbit.on('log', (component, level, ...args) => {
    if (level != 'trace') log(level, `Rabbit: ${component} ${args.join(' ')}`)
})