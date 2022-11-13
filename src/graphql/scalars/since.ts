import { GraphQLScalarType } from 'graphql';
import { DateTime } from 'luxon';
import { timestampFromSince } from '../../dateTimeFormats.js';

export const sinceScalar = new GraphQLScalarType({
    name: 'Since',
    description: 'Since',
    serialize: async (value: unknown) => {
        return (value as DateTime).toISO()
    },
    parseValue: async (value: unknown) => {
        return timestampFromSince(value as string)
    }
})