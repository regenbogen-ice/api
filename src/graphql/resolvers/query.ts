import database from '../../database.js'
import limitParser from '../../limitParser.js'
import trip_rabbit_updates from '../../logics/trip_rabbit_update.js'
import autocompletev2 from '../../webserver/paths/autocomplete/v2.js'
import { getValueMapping, train_type_mapping, valueMappingWhereBuilder } from '../mappings.js'

export const trainVehicleQuery = async (parent: any, args: { q: string, train_type?: string }) => {
    const train_types = getValueMapping(train_type_mapping, args.train_type || 'ICE')
    let train_vehicle = await database('train_vehicle')
        .where(builder => valueMappingWhereBuilder(builder, 'train_type', train_types))
        .where({ train_vehicle_number: args.q }).select('*').first()
    if (!train_vehicle) {
        train_vehicle = await database('train_vehicle')
            .where(builder => valueMappingWhereBuilder(builder, 'train_type', train_types))
            .whereRaw(`LOWER(train_vehicle_name) LIKE ?`, [args.q]).select('*').first()
    }
    return train_vehicle
}

export const trainTripQuery = async (parent: any, args: { train_number: number, train_type?: string, limit?: number, initial_departure?: string }) => {
    const train_type = args.train_type || 'ICE'
    let query = database('train_trip').where({ train_type, train_number: args.train_number })
        .orderBy('initial_departure', 'desc')
        .select('*').limit(limitParser('train_trips', args.limit))
    if (args.initial_departure)
        query = query.where({ initial_departure: args.initial_departure })
    const trips = await query
    await trip_rabbit_updates(trips)
    return trips
}

export const trainTripsQuery = async (parent: any, args: { train_number: number, train_type?: string}) => {
    return {
        train_type: args.train_type || 'ICE',
        train_number: args.train_number
    }
}

export const coachQuery = async (parent: any, args: { uic: string, limit?: number}) => {
    return await database('coach').where({ uic: args.uic }).limit(limitParser('coaches', args.limit))
}

export const autocompleteQuery = async (parent: any, args: { q: string, types?: string[]}) => {
    const types = args.types ? args.types : ['train_vehicle','train_trip','coach']
    return await autocompletev2.handler({ q: args.q, types })
}