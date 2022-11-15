import { DateTime } from 'luxon'
import { timestampFromSince, toSQLTimestamp } from '../../dateTimeFormats.js'
import externalSQLLoader from '../../externalSqlLoader.js'
import limitParser from '../../limitParser.js'

export const trainVehicleAverageDelay = async (parent: any, args: { since: DateTime}) => {
    const since = args.since || timestampFromSince('1m')
    return (await externalSQLLoader('average_delay_vehicle', [parent.id, toSQLTimestamp(since)]))[0].average
}

export const trainTripsAverageDelay = async (parent: any, args: { since: DateTime}) => {
    const since = args.since || timestampFromSince('1m')
    return (await externalSQLLoader('average_delay_trip', [parent.train_type, parent.train_number, toSQLTimestamp(since)]))[0].average
}

export const trainTripsMostTrainVehicles = async (parent: any, args: { limit?: number }) => {
    return (await externalSQLLoader('most_train_vehicle', [parent.train_type, parent.train_number, limitParser('most_train_vehicles', args.limit)]))
}