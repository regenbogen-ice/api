import expressAsyncHandler from 'express-async-handler';
import database from '../../database.js';
import { JSToISO } from '../../dateTimeFormats.js';
import { stationNameByEva } from '../../evaFetch.js';
import { app } from '../webserver.js';

app.get('/api/train_vehicle', expressAsyncHandler(async (req, res) => {
    if (!Object.keys(req.query).includes('q')) {
        res.status(400).send('Provide parameter q.')
    }

    const q = String(req.query.q)
    const coach_sequence_limit = parseInt((req.query.coach_sequence_limit || '0').toString())
    const include_coaches = req.query.include_coaches === 'true' || true
    const trip_limit = parseInt((req.query.trip_limit || '0').toString())
    const include_routes = req.query.include_routes === 'true' || true
    const include_marudor_link = req.query.include_marudor_link === 'true' || false
    
    let train_vehicle = await database('train_vehicle').where({ train_vehicle_number: q }).select('*').first()
    if (!train_vehicle) {
        train_vehicle = await database('train_vehicle').whereRaw(`LOWER(train_vehicle_name) LIKE ?`, [q]).select('*').first()
    }

    if (!train_vehicle)
        res.status(404).json({ error: `Train vehicle doen't exists.` })

    const data_object: any = {
        number: train_vehicle.train_vehicle_number,
        name: train_vehicle.train_vehicle_name,
        train_type: train_vehicle.train_type,
        building_series: train_vehicle.building_series,
    }

    if (coach_sequence_limit > 0) {
        const coach_sequences_db = await database('coach_sequence').where({ train_vehicle_id: train_vehicle.id }).orderBy('timestamp', 'desc').select(['id', 'timestamp']).limit(coach_sequence_limit)
        const coach_sequences: any[] = []
        for (const coach_sequence of coach_sequences_db) {
            const data: any = { timestamp: JSToISO(coach_sequence.timestamp) }
            if (include_coaches) {
                data['coaches'] = await database('coach').where({ coach_sequence_id: coach_sequence.id }).select(['index', 'uic', 'category', 'class', 'type'])
            }
            coach_sequences.push(data)
        }
        data_object['coach_sequences'] = coach_sequences
    }

    if (trip_limit > 0) {
        const trips_db = await database('train_trip_vehicle').where({ train_vehicle_id: train_vehicle.id })
        .join('train_trip', 'train_trip_vehicle.train_trip_id', '=', 'train_trip.id')
        .select(['train_trip_vehicle.group_index', 'train_trip_vehicle.timestamp', 'train_trip.train_type','train_trip.train_number', 'train_trip.origin_station', 'train_trip.destination_station', 'train_trip.initial_departure', 'train_trip.timestamp as train_trip_timestamp', 'train_trip.id']).orderBy('train_trip.initial_departure', 'desc').limit(trip_limit)
        const trips = []
        for (const trip of trips_db) {
            const data: any = {
                group_index: trip.group_index,
                vehicle_timestamp: JSToISO(trip.timestamp),
                trip_timestamp: JSToISO(trip.train_trip_timestamp),
                initial_departure: JSToISO(trip.initial_departure),
                train_type: trip.train_type,
                train_number: trip.train_number,
                origin_station: trip.origin_station ? await stationNameByEva(trip.origin_station) : null,
                destination_station: trip.destination_station ? await stationNameByEva(trip.destination_station) : null,
            }

            if (include_marudor_link)
                data['marudor'] = `https://marudor.de/details/${data.train_type}%20${data.train_number}/${data.initial_departure}`

            if (include_routes) {
                const stops_db = await database('train_trip_route').where({ train_trip_id: trip.id }).select(['index', 'cancelled', 'station', 'scheduled_departure', 'departure', 'scheduled_arrival', 'arrival'])
                const stops = []
                for (const stop of stops_db) {
                    stops.push({
                        index: stop.index,
                        cancelled: stop.cancelled,
                        station: await stationNameByEva(stop.station),
                        scheduled_departure: stop.scheduled_departure ? JSToISO(stop.scheduled_departure) : null,
                        departure: stop.departure ? JSToISO(stop.departure) : null,
                        scheduled_arrival: stop.scheduled_arrival ? JSToISO(stop.scheduled_arrival) : null,
                        arrival: stop.arrival ? JSToISO(stop.arrival) : null,
                    })
                }
                data['stops'] = stops
                if (include_marudor_link && stops.length > 0)
                    data['marudor'] += `?station=${stops_db[0].station}`
            }
            trips.push(data)
        }
        data_object['trips'] = trips
    }

    res.json(data_object)
}))