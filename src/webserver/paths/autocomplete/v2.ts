import { AutoCompleteResponse } from '../../../../@types/index.js'
import database from "../../../database.js"
import { ParserArguments } from "../../helpers/parser.js"
import { getSortedAutoCompleteList } from "./logic.js"

type V2Request = { q: string }


const v2 = async ({ q }: V2Request): Promise<AutoCompleteResponse> => {
    let possibilities = []
    if (Number(q)) {
        possibilities = (await database('train_vehicle').where('train_vehicle_number', 'like', `%${q}%`).select(['train_vehicle_number', 'train_type'])).map(v => ({ guess: String(v.train_vehicle_number), type: v.train_type }))
    } else {
        possibilities = getSortedAutoCompleteList(q, (await database('train_vehicle').whereRaw('LOWER(train_vehicle_name) like ?', [`%${q}%`]).select(['train_vehicle_name', 'train_type']).limit(100)).map(v => ({ guess: v.train_vehicle_name, type: v.train_type })))
    }

    return possibilities
}

const v2RequestBuilder = (args: ParserArguments): V2Request => {
    return { q: args.getString('q') }
}

export default {
    handler: v2,
    argumentBuilder: v2RequestBuilder
}