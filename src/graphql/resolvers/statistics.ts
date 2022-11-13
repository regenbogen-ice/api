import { DateTime } from 'luxon'
import { timestampFromSince, toSQLTimestamp } from '../../dateTimeFormats.js'
import externalSQLLoader from '../../externalSqlLoader.js'

export const trainVehicleAverageDelay = async (parent: any, args: { since: DateTime}) => {
    const since = args.since || timestampFromSince('1m')
    return (await externalSQLLoader('average_delay_vehicle', [parent.id, toSQLTimestamp(since)]))[0].average
}

export const trainTripAverageDelay = async (parent: any, args: { since: DateTime}) => {
    const since = args.since || timestampFromSince('1m')
    return (await externalSQLLoader('average_delay_trip', [parent.id, toSQLTimestamp(since)]))[0].average
}