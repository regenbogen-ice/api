import { GraphQLScalarType } from 'graphql';
import { stationEvaByName, stationNameByEva } from '../../evaFetch.js';

export const evaNumberScalar = new GraphQLScalarType({
    name: 'EvaNumber',
    description: 'Eva number of a station.',
    serialize: async (value: unknown) => {
        if (value) {
            try {
                return await stationNameByEva(value as number)
            } catch (e)  {
                console.error(`Error while serializing eva scalar: ${value}: ${e}`)
                return "Unknown"
            }
        }
    },
    parseValue: async (value: unknown) => {
        return (await stationEvaByName(value as string, 10))[0].evaNumber
    }
})