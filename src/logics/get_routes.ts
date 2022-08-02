import { DateTime } from 'luxon'
import database from '../database.js'
import { JSToISO } from '../dateTimeFormats.js'
import { stationNameByEva } from '../evaFetch.js'
import { rabbit } from '../rabbit.js'

const get_routes = async (trip: any): Promise<{ stops: any[], firstStation: number | null}> => {
    let stops_db = await database('train_trip_route').where({ train_trip_id: trip.id }).orderBy('index', 'asc').select(['cancelled', 'station', 'scheduled_departure', 'departure', 'scheduled_arrival', 'arrival'])
    if (stops_db.length === 0)
        return { stops: [], firstStation: null }
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
    const firstStation = stops_db[0].station
    if (trip.routes_update_expire && DateTime.fromJSDate(trip.initial_departure).plus({ days: 2 }) > DateTime.now() && DateTime.fromJSDate(trip.routes_update_expire) < DateTime.now()) {
        rabbit.publish('fetch_train_details', {
            trainId: trip.id,
            trainNumber: trip.train_number,
            trainType: trip.train_type,
            initialDeparture: JSToISO(trip.initial_departure),
            evaNumber: trip.origin_station
        })
    }
    return { stops, firstStation}
}

export default get_routes