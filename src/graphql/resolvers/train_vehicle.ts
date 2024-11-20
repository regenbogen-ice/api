import { DateTime } from 'luxon'
import database from '../../database.js'
import { toSQLTimestamp } from '../../dateTimeFormats.js'
import trip_rabbit_updates from '../../logics/trip_rabbit_update.js'
import { train_type_mapping } from '../mappings.js'
import externalSQLLoader from '../../externalSqlLoader.js'
import limitParser from '../../limitParser.js'

export const trainVehicleTripsQuery = async (parent: any, args: { limit?: number, ignore_finished_trips?: boolean, min_trips?: number }) => {
    const limit = limitParser('train_trips', args.limit)
    const min_trips = args.min_trips != null && args.min_trips != undefined && args.min_trips < limit ? args.min_trips : 1
    const queryTemplate = () => database('train_trip_vehicle')
        .join('train_trip', function() {
            this.on('train_trip_vehicle.train_trip_id', '=', 'train_trip.id')
            .andOn('train_trip_vehicle.train_vehicle_id', '=', parent.id)
        })
        .select(['train_trip_vehicle.group_index', 'train_trip_vehicle.origin', 'train_trip_vehicle.destination', 'train_trip_vehicle.timestamp', 'train_trip.train_type','train_trip.train_number', 'train_trip.origin_station', 'train_trip.destination_station', 'train_trip.initial_departure', 'train_trip.timestamp as train_trip_timestamp', 'train_trip.id', 'train_trip.routes_update_expire', 'train_trip.coach_sequence_update_expire'])
        .orderBy('train_trip.initial_departure', 'desc')
    let query = queryTemplate().limit(limit)
    if (args.ignore_finished_trips) {
        query = query.whereRaw('(SELECT MAX(arrival) FROM train_trip_route WHERE train_trip_id=train_trip.id) > ?', [toSQLTimestamp(DateTime.now().minus({ minutes: 5 }))])
            .whereRaw('(SELECT COUNT(id) FROM train_trip_route WHERE train_trip_id=train_trip.id) > 0')
    }
    let trips = await query
    if (trips.length < min_trips && args.ignore_finished_trips) {
        query = queryTemplate()
        query.limit(min_trips)
        trips = await query
    }
    trips.forEach(trip => trip_rabbit_updates(trip))
    return trips
}

export const trainVehicleCoachSequencesQuery = async (parent: any, args: { limit?: number }) => {
    return await database('coach_sequence').where({ train_vehicle_id: parent.id })
        .orderBy('timestamp', 'desc').select(['id', 'timestamp', 'train_vehicle_id']).limit(limitParser('coach_sequence', args.limit))
}

export const trainVehicleTrainTypeQuery = async (parent: any, args: { get_raw_type?: boolean } ) => {
    if (args.get_raw_type)
        return parent.train_type
    return train_type_mapping[parent.train_type] || parent.train_type
}

export const mostStationsQuery = async (parent: any, args : { limit?: number}) => {
    return await externalSQLLoader('most_stations', [parent.id, limitParser('most_stations', args.limit)])
}
