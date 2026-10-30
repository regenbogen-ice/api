import { ApolloServer } from '@apollo/server'
import { randomBytes } from 'crypto'
import { readFileSync } from 'fs'
import resolvers from './resolvers/resolvers.js'
import responseCachePlugin from '@apollo/server-plugin-response-cache'
import { unwrapResolverError } from '@apollo/server/errors'

export const apolloServer = new ApolloServer({
    typeDefs: readFileSync(process.env.GRAPHQL_SCHEMA_PATH || 'schema.graphql', { encoding: 'utf-8' }),
    resolvers,
    introspection: true,
    formatError: (formattedError, error) => {
        const errorCode = randomBytes(16).toString('hex')
        const originalError = unwrapResolverError(error)
        console.error(`Error ${errorCode} while request: ${originalError}`)
        if (originalError instanceof Error && originalError.stack) {
            console.log(originalError.stack)
        }
        let message = 'Internal server error.'
        if (formattedError.extensions?.code == "GRAPHQL_VALIDATION_FAILED") {
            message = formattedError.message
        }
        return {
            message: message,
            error_code: errorCode
        } as any
    },
    plugins: [
        responseCachePlugin()
    ]
})

await apolloServer.start()
