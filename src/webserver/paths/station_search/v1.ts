import { stationEvaByName } from '../../../evaFetch.js'
import { ParserArguments } from '../../helpers/parser.js'

type V1Request = {
    q: string,
    length: number
}

type V1Response = Array<{
    evaNumber: number,
    name: string
}>

const v1 = async (request: V1Request): Promise<V1Response> => {
    return await stationEvaByName(request.q, request.length)
}

const v1ArgumentBuilder = (args: ParserArguments): V1Request => ({
    q: args.getString('q'),
    length: args.getNumber('length')
})

export default {
    handler: v1,
    argumentBuilder: v1ArgumentBuilder
}