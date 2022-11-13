import { DateTime } from 'luxon'
import database from '../../database.js'
import { JSToISO } from '../../dateTimeFormats.js'
import { rabbit } from '../../rabbit.js'
import { TRAIN_VEHICLE_SELECTS } from '../sql_selects.js'

export const trainTripStopsQuery = async (parent: any, args: any, conext: any, info: any) => {
    let stops = await database('train_trip_route').where({ train_trip_id: parent.id })
        .orderBy('index', 'asc')
        .select(['cancelled', 'station', 'scheduled_departure', 'departure', 'departure_delay', 'scheduled_arrival', 'arrival', 'arrival_delay'])
    if (parent.origin) {
        const origin_stations = stops.filter(e => e.station == parent.origin)
        if (origin_stations.length == 1)
        stops = stops.slice(stops.indexOf(origin_stations[0]))
    }
    if (parent.destination) {
        const destination_stations = stops.filter(e => e.station == parent.destination)
        if (destination_stations.length == 1)
        stops = stops.slice(0, stops.indexOf(destination_stations[0]) + 1)
    }

    if (parent.routes_update_expire && DateTime.fromJSDate(parent.initial_departure).plus({ days: 2 }) > DateTime.now() && DateTime.fromJSDate(parent.routes_update_expire) < DateTime.now()) {
        rabbit.publish('fetch_train_details', {
            trainId: parent.id,
            trainNumber: parent.train_number,
            trainType: parent.train_type,
            initialDeparture: JSToISO(parent.initial_departure),
            evaNumber: parent.origin_station
        })
    }

    return stops
}

export const trainTripVehiclesQuery = async (parent: any) => {
    return await database('train_trip_vehicle').where({ train_trip_id: parent.id })
        .join('train_vehicle', 'train_vehicle.id', '=', 'train_trip_vehicle.train_vehicle_id')
        .select(TRAIN_VEHICLE_SELECTS)
}

export const trainTripBahnExpertQuery = async (parent: any) => {
    return `https://bahn.expert/details/${parent.train_type}%20${parent.train_number}/${DateTime.fromJSDate(parent.initial_departure).toISO()}`
}

export const trainTripCoachLinksQuery = async (parent: any, args : { identification_number?: string }) => {
    let sql = database('train_trip_coaches_identification').where({ train_trip_id: parent.id })
    if (args.identification_number) {
        sql = sql.where({ identification_number: args.identification_number })
    }
    return await sql.limit(40)
}