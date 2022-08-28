import { GraphQLScalarType } from 'graphql';
import { DateTime } from 'luxon';

export const dateTimeScalar = new GraphQLScalarType({
    name: 'DateTime',
    description: 'A ISO DateTime',
    serialize: async (value: unknown) => {
        return DateTime.fromJSDate(value as Date).toISO()
    },
    parseValue: async (value: unknown) => {
        return DateTime.fromISO(value as string).setZone('UTC').toFormat('yyyy-LL-dd HH:mm:ss')
    }
})