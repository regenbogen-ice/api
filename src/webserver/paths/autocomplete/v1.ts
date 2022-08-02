import { ParserArguments } from "../../helpers/parser.js"
import v2 from "./v2.js"

type V1Request = { q: string }
type V1Response = Array<string>

export default {
    handler: async ({ q }: V1Request): Promise<V1Response> => {
        return (await v2.handler({ q })).map(e => e.guess)
    },
    argumentBuilder: (args: ParserArguments) => ({ q: args.getString('q') })
}