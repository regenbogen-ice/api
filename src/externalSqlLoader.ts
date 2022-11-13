import { config } from 'dotenv'
import { readFileSync } from 'fs'
import knex from 'knex'
import path from 'path'
import database from './database.js'
import redis from './redis.js'

config()

const SQL_DIRECTORY = process.env.SQL_DIRECTORY || 'sql'

const loadSQL = async (name: string, args: any[]) => {
    const redis_key = 'external_sql_' + name
    let content = await redis.get('external_sql_' + name)
    if (!content || process.env.DISABLE_SQL_REDIS == 'true') {
        content = readFileSync(path.join(SQL_DIRECTORY, name + '.sql')).toString('utf-8')
        redis.set(redis_key, content, { EX: 60 * 60 })
    }
    return (await database.raw(content, args))[0]
}

export default loadSQL
