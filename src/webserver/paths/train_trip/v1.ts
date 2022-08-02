import { TrainTrip } from '../../../../@types/index.js'
import database from '../../../database.js'
import { JSToISO } from '../../../dateTimeFormats.js'
import { RegenbogenICEError } from '../../../errors.js'
import { stationNameByEva } from '../../../evaFetch.js'
import get_routes from '../../../logics/get_routes.js'
import { ParserArguments } from '../../helpers/parser.js'
import { v1 as trainVehicleApi } from '../train_vehicle/v1.js'

type V1Request = {
    train_number: string,
    train_type: string,
    trip_limit: number,
    include_marudor_link: boolean
    include_routes: boolean,
    include_train_vehicle: boolean,
    coach_sequence_limit: number,
    include_coaches: boolean,
}

const v1 = async (request: V1Request): Promise<Array<TrainTrip>> => {
    const select_train_trip = [
        'train_trip.id',
        'train_trip.train_number',
        'train_trip.train_type',
        'train_trip.origin_station',
        'train_trip.destination_station',
        'train_trip.initial_departure',
        'train_trip.timestamp as train_trip_timestamp'
    ]
    let train_trip_query = database('train_trip').where('train_trip.train_type', '=', request.train_type).where({ train_number: request.train_number })
        .orderBy('initial_departure', 'desc').limit(request.trip_limit)
    
    if (request.include_train_vehicle) {
        train_trip_query = train_trip_query
            .join('train_trip_vehicle', 'train_trip_vehicle.train_trip_id', 'train_trip.id')
            .join('train_vehicle', 'train_trip_vehicle.train_vehicle_id', 'train_vehicle.id')
        select_train_trip.push(...[
            'train_vehicle.train_vehicle_number'
        ])
    }
    const train_trips = await train_trip_query.select(select_train_trip)
    if (train_trips.length == 0) {
        throw new RegenbogenICEError('Train trip doesn\'t exist.', 404)
    }
    const data_objects = []
    for (const trip of train_trips) {
        const data_object: any = {
            train_number: trip.train_number,
            train_type: trip.train_type,
            origin_station: trip.origin_station ? await stationNameByEva(trip.origin_station) : null,
            destination_station: trip.destination_station ? await stationNameByEva(trip.destination_station) : null,
            initial_departure: JSToISO(trip.initial_departure),
            timestamp: JSToISO(trip.train_trip_timestamp)
        }

        if (request.include_train_vehicle) {
            data_object['train_vehicle'] = await trainVehicleApi({
                q: trip.train_vehicle_number,
                train_type: request.train_type,
                coach_sequence_limit: request.coach_sequence_limit,
                include_coaches: request.include_coaches,
                trip_limit: 0,
                include_routes: false,
                include_marudor_link: false
            })
        }

        if (request.include_marudor_link) {
            data_object['marudor'] = `https://marudor.de/details/${data_object.train_type}%20${data_object.train_number}/${data_object.initial_departure}`
        }

        if (request.include_routes) {
            const { stops, firstStation } = await get_routes(trip)
            data_object['stops'] = stops
            if (request.include_marudor_link && firstStation)
                    data_object['marudor'] += `?station=${firstStation}`
        }
        data_objects.push(data_object)
    }

    return data_objects
}

const v1ArgumentBuilder = (args: ParserArguments): V1Request => ({
    train_number: args.getString('train_number'),
    train_type: args.getString('train_type'),
    trip_limit: args.getNumber('trip_limit'),
    include_marudor_link: args.getBoolean('include_marudor_link'),
    include_routes: args.getBoolean('include_routes'),
    include_train_vehicle: args.getBoolean('include_train_vehicle'),
    coach_sequence_limit: args.getNumber('coach_sequence_limit'),
    include_coaches: args.getBoolean('include_coaches')
})

export default {
    handler: v1,
    argumentBuilder: v1ArgumentBuilder
}