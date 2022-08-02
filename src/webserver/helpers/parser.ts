import { RequestHandler, Response } from "express"
import { RegenbogenICEError } from "../../errors.js"


export type VariableType = {
    type: 'string' | 'boolean' | 'number',
    default?: string,
    required?: boolean
}

export type ParserConfiguration = {
    params?: { [key: string]: VariableType },
    query?: { [key: string]: VariableType }
}


export class ParserArguments {
    args: { [key: string]: any }
    constructor (args: { [key: string]: any }) {
        this.args = args
    }

    getString(name: string): string {
        return this.args[name]
    }

    getBoolean(name: string): boolean {
        return this.args[name]
    }

    getNumber(name: string): number {
        return this.args[name]
    }
}

const badRequest = (res: Response, field: string, location: string) => { throw new RegenbogenICEError('Bad Request', 400, { field, location }) }

const parseVariable = (input: string, type: VariableType, field: string): any => {
    if (!input && type.default) {
        input = type.default
    }
    if (!input) {
        return null
    }
    if (type.type == 'string') {
        return input
    } else if (type.type == 'number') {
        const parsed = parseInt(input)
        if (isNaN(parsed)) {
            throw new RegenbogenICEError(`Bad Request. Number parsing error while parsing field ${field}.`, 400)
        }
        return parsed
    } else if (type.type == 'boolean') {
        input = input.toLowerCase()
        if (input == 'true') {
            return true
        } else if (input == 'false') {
            return false
        } else {
            throw new RegenbogenICEError(`Bad Request. Boolean parsing error while parsing field ${field}.`, 400)
        }
    }
}

const parser = (parserConfiguration: ParserConfiguration): RequestHandler => {
    return (req, res, next) => {
        const args: { [key: string]: any } = {}
        if (parserConfiguration.params) {
            for (const [k, v] of Object.entries(parserConfiguration.params)) {
                const value = req.params[k]
                if (!value && v.required) {
                    badRequest(res, k, 'params')
                    return
                }
                args[k] = parseVariable(value, v, k)
            }
        }

        if (parserConfiguration.query) {
            for (const [k, v] of Object.entries(parserConfiguration.query)) {
                const value = req.query[k] as string
                if (!value && v.required) {
                    badRequest(res, k, 'query')
                    return
                }
                args[k] = parseVariable(value, v, k)
            }
        }
        const parserArguments = new ParserArguments(args)
        res.locals.args = parserArguments
        next()
    }
}

export default parser