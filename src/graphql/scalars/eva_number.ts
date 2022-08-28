import { GraphQLScalarType } from 'graphql';
import { stationEvaByName, stationNameByEva } from '../../evaFetch.js';

export const evaNumberScalar = new GraphQLScalarType({
    name: 'EvaNumber',
    description: 'Eva number of a station.',
    serialize: async (value: unknown) => {
        if (value)
            return await stationNameByEva(value as number)
    },
    parseValue: async (value: unknown) => {
        return (await stationEvaByName(value as string, 10))[0].evaNumber
    }
})