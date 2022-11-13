import { readFileSync } from 'fs'
import knex from 'knex'
import path from 'path'
import database from './database.js'

const SQL_DIRECTORY = process.env.SQL_DIRECTORY || 'sql'

const loadSQL = async (name: string, args: any[]) => {
    let content = readFileSync(path.join(SQL_DIRECTORY, name + '.sql')).toString('utf-8')
    return (await database.raw(content, args))[0]
}

export default loadSQL
