import { DateTime } from 'luxon'
import { timestampFromSince, toSQLTimestamp } from '../../dateTimeFormats.js'
import externalSQLLoader from '../../externalSqlLoader.js'
import staticConfig from '../../staticConfig.js'

export const trainVehicleAverageDelay = async (parent: any, args: { since: DateTime}) => {
    const since = args.since || timestampFromSince('1m')
    return (await externalSQLLoader('average_delay_vehicle', [parent.id, toSQLTimestamp(since)]))[0].average
}

export const trainTripAverageDelay = async (parent: any, args: { since: DateTime}) => {
    const since = args.since || timestampFromSince('1m')
    return (await externalSQLLoader('average_delay_trip', [parent.id, toSQLTimestamp(since)]))[0].average
}

export const trainTripMostTrainVehicles = async (parent: any, args: { limit?: number }) => {
    const limit = args.limit ? args.limit <= staticConfig.RETURN_LIMIT.most_train_vehicles.max ? args.limit : staticConfig.RETURN_LIMIT.most_train_vehicles.default : staticConfig.RETURN_LIMIT.most_train_vehicles.default // default value: 10, limit < 50
    return (await externalSQLLoader('most_train_vehicle', [parent.id, limit]))
}