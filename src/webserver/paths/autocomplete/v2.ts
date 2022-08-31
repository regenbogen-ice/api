import { AutoCompleteResponse } from '../../../../@types/index.js'
import database from "../../../database.js"
import { RegenbogenICEError } from '../../../errors.js'
import { ParserArguments } from "../../helpers/parser.js"
import { getSortedAutoCompleteList } from "./logic.js"

type V2Request = {
    q: string,
    types: Array<string>
 }

const splitLettersNumbers = (s: string) => {
    let index = -2;
    let endIndex = s.length;
    s.split('').forEach((v, i) => {
        if (isNaN(parseInt(v))) {
            if (index == -2)
                index = -1
            if (index > 0 && endIndex > i) {
                endIndex = i
            }
        } else if (index == -1 && endIndex == s.length) {
            index = i
        }
    })
    if (index > 0) {
        return [s.substring(0, index), s.substring(index, endIndex)]
    } else {
        return [s]
    }
}

const v2 = async ({ q, types }: V2Request): Promise<AutoCompleteResponse> => {
    q = q.toLowerCase().replace(' ', '')
    const splitted_q = splitLettersNumbers(q)

    let possibilities = []

    if (types.includes('train_trip') && splitted_q.length == 2 && splitted_q[0].length > 1) {
        // the first two letters are not a number -> IC or ICE e.g. : so get train_trip
        const train_type = splitted_q[0].toUpperCase()
        const train_number = parseInt(splitted_q[1])
        const trains = await database('train_trip')
            .where({ train_type })
            .where('train_number', 'like',`%${train_number}%`)
            .groupBy('train_number')
            .select(['train_number']).limit(100)
        possibilities = trains.map(train => ({ guess: train.train_number, train_type: train_type, type: 'train_trip' }))
    } else {
        if (Number(q)) {
            if (types.includes('train_vehicle')) {
                possibilities.push(
                    ...getSortedAutoCompleteList(
                        q,
                        (await database('train_vehicle').where('train_vehicle_number', 'like', `%${q}%`).select(['train_vehicle_number', 'train_type']))
                            .map(v => ({ guess: String(v.train_vehicle_number), train_type: v.train_type, type: 'train_vehicle' }))
                        )
                    )
            }
            if (types.includes('train_trip')) {
                const trains = await database('train_trip')
                    .where('train_number', 'like',`%${q}%`)
                    .groupBy('train_number', 'train_type')
                    .select(['train_number', 'train_type']).limit(100)
                possibilities.push(...getSortedAutoCompleteList(q, trains.map(train => ({ guess: String(train.train_number), train_type: train.train_type, type: 'train_trip' }))))
            }
            if (types.includes('coach')) {
                possibilities.push(...getSortedAutoCompleteList(q, (await database('coach')
                    .join('coach_sequence','coach_sequence.id', 'coach.coach_sequence_id')
                    .join('train_vehicle', 'train_vehicle.id', 'coach_sequence.train_vehicle_id')
                    .groupBy('coach.uic')
                    .where('coach.uic', 'like', `%${q}%`)
                    .select(['coach.uic', database.raw('GROUP_CONCAT(??) as train_type', ['train_vehicle.train_type'])])
                    .limit(100))
                    .map(c => ({ guess: c.uic, train_type: c.train_type.split(',')[0], type: 'coach' }))))
            }
        } else if (types.includes('train_vehicle')) {
            possibilities = getSortedAutoCompleteList(q, (await database('train_vehicle').whereRaw('LOWER(train_vehicle_name) like ?', [`%${q}%`]).select(['train_vehicle_name', 'train_type']).limit(100))
                .map(v => ({ guess: v.train_vehicle_name, train_type: v.train_type, type: 'train_vehicle' })))
        }
    }

    return possibilities
}

const v2RequestBuilder = (args: ParserArguments): V2Request => {
    return {
        q: args.getString('q'),
        types: args.getList('types')
    }
}

export default {
    handler: v2,
    argumentBuilder: v2RequestBuilder
}