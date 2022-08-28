import { ApolloServer } from 'apollo-server-express'
import { randomBytes } from 'crypto'
import { readFileSync } from 'fs'
import resolvers from './resolvers/resolvers.js'
import { default as origResponseCachePlugin } from 'apollo-server-plugin-response-cache';

type PluginType = typeof origResponseCachePlugin
const responseCachePlugin = (origResponseCachePlugin as any).default as PluginType

export const apolloServer = new ApolloServer({
    typeDefs: readFileSync(process.env.GRAPHQL_SCHEMA_PATH || 'schema.graphql', { encoding: 'utf-8' }),
    resolvers,
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
    },
    plugins: [
        responseCachePlugin(),
    ]
})

await apolloServer.start()