import { DateTime } from "luxon"
import database from "../../../database.js"
import { JSToISO } from "../../../dateTimeFormats.js"
import { stationNameByEva } from "../../../evaFetch.js"
import { rabbit } from "../../../rabbit.js"
import { ParserArguments } from "../../helpers/parser.js"
import { RegenbogenICEError } from "../../../errors.js"

type V1Request = {
    q: string,
    train_type: string,
    coach_sequence_limit: number,
    include_coaches: boolean,
    trip_limit: number,
    include_routes: boolean,
    include_marudor_link: boolean
}

type V1Response = {
    name: string | null,
    building_series: string | null,
    number: number,
    train_type: string,
    trips?: Array<{
        group_index: number,
        train_number: number,
        train_type: string,
        origin_station: string | null,
        destination_station: string | null,
        initial_departure: string, // date-time
        trip_timestamp: string, // date-time
        vehicle_timestamp: string, // date-time
        marudor?: string
        stops?: Array<{
            cancelled: boolean,
            station: string,
            scheduled_departure: string | null, // date-time
            departure: string | null, // date-time
            scheduled_arrival: string | null, // date-time
            arrival: string | null, // date-time
        }>
    }>,
    coach_sequences?: Array<{
        timestamp: string, // date-time
        coaches?: Array<{
            index: number,
            class: number,
            type: string,
            uic: string,
            category: string
        }>
    }>
}


const v1 = async (request: V1Request): Promise<V1Response> => {
    
    let train_vehicle = await database('train_vehicle').where({ train_type: request.train_type, train_vehicle_number: request.q }).select('*').first()
    if (!train_vehicle) {
        train_vehicle = await database('train_vehicle').where({ train_type: request.train_type }).whereRaw(`LOWER(train_vehicle_name) LIKE ?`, [request.q]).select('*').first()
    }

    if (!train_vehicle) {
        throw new RegenbogenICEError('Train vehicle doesn\'t exist.', 404)
    }

    const data_object: any = {
        number: train_vehicle.train_vehicle_number,
        name: train_vehicle.train_vehicle_name,
        train_type: train_vehicle.train_type,
        building_series: train_vehicle.building_series,
    }

    if (request.coach_sequence_limit > 0) {
        const coach_sequences_db = await database('coach_sequence').where({ train_vehicle_id: train_vehicle.id })
        .orderBy('timestamp', 'desc').select(['id', 'timestamp']).limit(request.coach_sequence_limit)
        const coach_sequences: any[] = []
        for (const coach_sequence of coach_sequences_db) {
            const data: any = { timestamp: JSToISO(coach_sequence.timestamp) }
            if (request.include_coaches) {
                data['coaches'] = await database('coach').where({ coach_sequence_id: coach_sequence.id }).select(['index', 'uic', 'category', 'class', 'type'])
            }
            coach_sequences.push(data)
        }
        data_object['coach_sequences'] = coach_sequences
    }

    if (request.trip_limit > 0) {
        const trips_db = await database('train_trip_vehicle').where({ train_vehicle_id: train_vehicle.id })
        .join('train_trip', 'train_trip_vehicle.train_trip_id', '=', 'train_trip.id')
        .select(['train_trip_vehicle.group_index', 'train_trip_vehicle.origin', 'train_trip_vehicle.destination', 'train_trip_vehicle.timestamp', 'train_trip.train_type','train_trip.train_number', 'train_trip.origin_station', 'train_trip.destination_station', 'train_trip.initial_departure', 'train_trip.timestamp as train_trip_timestamp', 'train_trip.id', 'train_trip.routes_update_expire', 'train_trip.coach_sequence_update_expire'])
        .orderBy('train_trip.initial_departure', 'desc').limit(request.trip_limit)
        const trips = []
        for (const trip of trips_db) {
            if (trip.coach_sequence_update_expire && DateTime.fromJSDate(trip.initial_departure).plus({ days: 2 }) > DateTime.now() && DateTime.fromJSDate(trip.coach_sequence_update_expire) < DateTime.now()) {
                rabbit.publish('fetch_coach_sequence', {
                    trainId: trip.id,
                    trainNumber: trip.train_number,
                    trainType: trip.train_type,
                    evaDeparture: JSToISO(trip.initial_departure),
                    evaNumber: trip.origin_station
                })
            }
            const data: any = {
                group_index: trip.group_index,
                vehicle_timestamp: JSToISO(trip.timestamp),
                trip_timestamp: JSToISO(trip.train_trip_timestamp),
                initial_departure: JSToISO(trip.initial_departure),
                train_type: trip.train_type,
                train_number: trip.train_number,
                origin_station: trip.origin ? await stationNameByEva(trip.origin) : trip.origin_station ? await stationNameByEva(trip.origin_station) : null,
                destination_station: trip.destination ? await stationNameByEva(trip.destination) : trip.destination_station ? await stationNameByEva(trip.destination_station) : null,
            }

            if (request.include_marudor_link)
                data['marudor'] = `https://marudor.de/details/${data.train_type}%20${data.train_number}/${data.initial_departure}`

            if (request.include_routes) {
                let stops_db = await database('train_trip_route').where({ train_trip_id: trip.id }).orderBy('index', 'asc').select(['cancelled', 'station', 'scheduled_departure', 'departure', 'scheduled_arrival', 'arrival'])
                if (stops_db.length === 0)
                    continue 
                if (trip.origin) {
                    const origin_stations = stops_db.filter(e => e.station == trip.origin)
                    if (origin_stations.length == 1)
                        stops_db = stops_db.slice(stops_db.indexOf(origin_stations[0]))
                }
                if (trip.destination) {
                    const destination_stations = stops_db.filter(e => e.station == trip.destination)
                    if (destination_stations.length == 1)
                        stops_db = stops_db.slice(0, stops_db.indexOf(destination_stations[0]) + 1)
                }
                const stops = []
                for (const stop of stops_db) {
                    stops.push({
                        cancelled: stop.cancelled,
                        station: await stationNameByEva(stop.station),
                        scheduled_departure: stop.scheduled_departure ? JSToISO(stop.scheduled_departure) : null,
                        departure: stop.departure ? JSToISO(stop.departure) : null,
                        scheduled_arrival: stop.scheduled_arrival ? JSToISO(stop.scheduled_arrival) : null,
                        arrival: stop.arrival ? JSToISO(stop.arrival) : null,
                    })
                }
                data['stops'] = stops
                if (request.include_marudor_link)
                    data['marudor'] += `?station=${stops_db[0].station}`
                if (trip.routes_update_expire && DateTime.fromJSDate(trip.initial_departure).plus({ days: 2 }) > DateTime.now() && DateTime.fromJSDate(trip.routes_update_expire) < DateTime.now()) {
                    rabbit.publish('fetch_train_details', {
                        trainId: trip.id,
                        trainNumber: trip.train_number,
                        trainType: trip.train_type,
                        initialDeparture: JSToISO(trip.initial_departure),
                        evaNumber: trip.origin_station
                    })
                }
            }
            trips.push(data)
        }
        data_object['trips'] = trips
    }
    return data_object
}

const v1ArgumentBuilder = (args: ParserArguments): V1Request => {
    return {
        q: args.getString('q'),
        train_type: args.getString('train_type'),
        coach_sequence_limit: args.getNumber('coach_sequence_limit'),
        include_coaches: args.getBoolean('include_coaches'),
        trip_limit: args.getNumber('trip_limit'),
        include_routes: args.getBoolean('include_routes'),
        include_marudor_link: args.getBoolean('include_marudor_link')
    }
}

export default {
    handler: v1,
    argumentBuilder: v1ArgumentBuilder
}