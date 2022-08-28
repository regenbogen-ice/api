import { ApolloServer } from 'apollo-server-express'
import { randomBytes } from 'crypto'
import { readFileSync } from 'fs'
import resolvers from './resolvers/resolvers.js'

export const apolloServer = new ApolloServer({
    typeDefs: readFileSync(process.env.GRAPHQL_SCHEMA_PATH || 'schema.graphql', { encoding: 'utf-8' }),
    resolvers: resolvers,
    cache: 'bounded',
    introspection: true,
    formatError: (error) => {
        const errorCode = randomBytes(16).toString('hex')
        console.error(`Error ${errorCode} while request: ${error}`)
        console.error(error.stack)
        return {
            message: 'Internal server error.',
            error_code: errorCode
        }
    }
})

await apolloServer.start()