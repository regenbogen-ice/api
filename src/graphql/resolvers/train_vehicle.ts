import database from '../../database.js'
import trip_rabbit_updates from '../../logics/trip_rabbit_update.js'

export const trainVehicleTripsQuery = async (parent: any, args: { limit?: number }) => {
    const limit = args.limit ? args.limit <= 100 ? args.limit : 5 : 5 // default value: 5, limit <= 100
    const trips = await database('train_trip_vehicle').where({ train_vehicle_id: parent.id })
        .join('train_trip', 'train_trip_vehicle.train_trip_id', '=', 'train_trip.id')
        .select(['train_trip_vehicle.group_index', 'train_trip_vehicle.origin', 'train_trip_vehicle.destination', 'train_trip_vehicle.timestamp', 'train_trip.train_type','train_trip.train_number', 'train_trip.origin_station', 'train_trip.destination_station', 'train_trip.initial_departure', 'train_trip.timestamp as train_trip_timestamp', 'train_trip.id', 'train_trip.routes_update_expire', 'train_trip.coach_sequence_update_expire'])
        .orderBy('train_trip.initial_departure', 'desc').limit(limit)
    trips.forEach(trip => trip_rabbit_updates(trip))
    return trips
}

export const trainVehicleCoachSequencesQuery = async (parent: any, args: { limit?: number }) => {
    const limit = args.limit ? args.limit <= 20 ? args.limit : 1 : 1 // default value: 1, limit <= 20
    return await database('coach_sequence').where({ train_vehicle_id: parent.id })
        .orderBy('timestamp', 'desc').select(['id', 'timestamp', 'train_vehicle_id']).limit(limit)
}