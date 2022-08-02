import expressAsyncHandler from "express-async-handler"
import staticConfig from "../../staticConfig.js"
import { app } from "../webserver.js"
import parser, { ParserArguments, ParserConfiguration } from "./parser.js"

type Handler<Type> = {
    argumentBuilder: (args: ParserArguments) => Type
    handler: (values: Type) => Promise<any>,
}

const register = <Type>(
    method: string,
    path: string,
    parserConfiguration: ParserConfiguration,
    handler: Handler<Type>
) => {
    app.get(staticConfig.API_PATH + path, parser(parserConfiguration), expressAsyncHandler(async (req, res) => {
        const args: ParserArguments = res.locals.args
        res.json(await handler.handler(handler.argumentBuilder(args)))
    }))
}

export default register