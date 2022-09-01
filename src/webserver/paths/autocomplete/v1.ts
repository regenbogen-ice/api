import { AutoCompleteResponseV1 } from '../../../../@types/index.js'
import { ParserArguments } from "../../helpers/parser.js"
import v2 from "./v2.js"

type V1Request = { q: string }

export default {
    handler: async ({ q }: V1Request): Promise<AutoCompleteResponseV1> => {
        return (await v2.handler({ q, types: ['train_vehicle'] })).map(e => e.guess)
    },
    argumentBuilder: (args: ParserArguments) => ({ q: args.getString('q') })
}