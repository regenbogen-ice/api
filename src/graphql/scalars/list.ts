import { GraphQLScalarType } from 'graphql';

export const listScalar = new GraphQLScalarType({
    name: 'List',
    description: 'List',
    serialize: async (value: unknown) => {
        return (value as string[]).join(',')
    },
    parseValue: async (value: unknown) => {
        return (value as string).split(',')
    }
})