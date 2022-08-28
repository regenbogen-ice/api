import database from '../../database.js'
import trip_rabbit_updates from '../../logics/trip_rabbit_update.js'
import autocompletev2 from '../../webserver/paths/autocomplete/v2.js'

export const trainVehicleQuery = async (parent: any, args: { q: string, train_type?: string }) => {
    const train_type = args.train_type || 'ICE'
    let train_vehicle = await database('train_vehicle').where({ train_type, train_vehicle_number: args.q }).select('*').first()
    if (!train_vehicle) {
        train_vehicle = await database('train_vehicle').where({ train_type }).whereRaw(`LOWER(train_vehicle_name) LIKE ?`, [args.q]).select('*').first()
    }
    return train_vehicle
}

export const trainTripQuery = async (parent: any, args: { train_number: number, train_type?: string, limit: number}) => {
    const train_type = args.train_type || 'ICE'
    const limit = args.limit ? args.limit < 100 ? args.limit : 5 : 5 // default value: 5, limit < 100
    const trips = await database('train_trip').where({ train_type, train_number: args.train_number })
        .select('*').limit(limit)
    await trip_rabbit_updates(trips)
    return trips
}

export const coachQuery = async (parent: any, args: { uic: string}) => {
    return await database('coach').where({ uic: args.uic }).first()
}

export const autocompleteQuery = async (parent: any, args: { q: string, types?: string[]}) => {
    const types = args.types ? args.types : ['train_vehicle','train_trip','coach']
    return await autocompletev2.handler({ q: args.q, types })
}