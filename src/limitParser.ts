type ConfigObject = {
    default: number,
    min?: number,
    max: number
}

type Config = {
    train_trips: ConfigObject
    coach_sequence: ConfigObject
    coaches: ConfigObject
    most_stations: ConfigObject
    most_train_vehicles: ConfigObject
    coach_links:  ConfigObject
}

const config: Config = {
    train_trips: {
        default: 5,
        max: 500
    },
    coach_sequence: {
        default: 1,
        max: 50
    },
    coaches: {
        default: 1,
        max: 50
    },
    most_stations: {
        default: 10,
        max: 50
    },
    most_train_vehicles: {
        default: 10,
        max: 50
    },
    coach_links:{
        default: 10,
        max: 50
    }
}

export default (type: keyof Config, limit?: number): number => {
    const o = config[type]
    limit = limit == null || limit == undefined ? o.default : limit
    const min = config[type].min || 0
    const max = config[type].max
    if (limit < min) {
        limit = min
    } else if (limit > max) {
        limit = max
    }
    return limit
}