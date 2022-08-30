export const getValueMapping = (mapping: { [key: string]: string }, value: string): string[] => {
    const keys: string[] = []
    for (const [k, v] of Object.entries(mapping)) {
        if (v == value)
            keys.push(k)
    }
    return keys
}

export const valueMappingWhereBuilder = (builder: any, whereKey: string, values: string[]) => {
    for (const v of values) {
        builder = builder.orWhere(whereKey, '=', v)
    }
    return builder
}

export const train_type_mapping: { [key: string]: string } = {
    "ICK": "IC",
    "ICD": "IC"
}