import { ApolloServer } from 'apollo-server-express'
import { readFileSync } from 'fs'
import resolvers from './resolvers/resolvers.js'

export const apolloServer = new ApolloServer({
    typeDefs: readFileSync(process.env.GRAPHQL_SCHEMA_PATH || 'schema.graphql', { encoding: 'utf-8' }),
    resolvers: resolvers,
    cache: 'bounded',
    introspection: true,
    formatError: (error) => {
        return new Error(`Internal server error.`)
    }
})

await apolloServer.start()