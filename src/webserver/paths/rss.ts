import expressAsyncHandler from 'express-async-handler';
import { app } from '../webserver.js';
import RSS from 'rss'
import database from '../../database.js';
import { JSToISO, toGermanDate } from '../../dateTimeFormats.js';
import { DateTime } from 'luxon';
import { stationEvaByName, stationNameByEva } from '../../evaFetch.js';


app.get('/rss', expressAsyncHandler(async (req, res) => {
    const feed = new RSS({
        title: 'Wo ist der RegenbogenICE?',
        feed_url: 'https://regenbogen-ice.de/rss',
        site_url: 'https://regenbogen-ice.de',
        image_url: 'https://regenbogen-ice.de/images/twittercard.png',
    })

    const train_vehicle = await database('train_vehicle').where({ train_type: 'ICE', train_vehicle_number: 304 }).first()
    const trips_db = await database('train_trip_vehicle').where({ train_vehicle_id: train_vehicle.id })
        .join('train_trip', 'train_trip_vehicle.train_trip_id', '=', 'train_trip.id')
        .select(['train_trip_vehicle.group_index', 'train_trip_vehicle.origin', 'train_trip_vehicle.destination', 'train_trip_vehicle.timestamp', 'train_trip.train_type','train_trip.train_number', 'train_trip.origin_station', 'train_trip.destination_station', 'train_trip.initial_departure', 'train_trip.timestamp as train_trip_timestamp', 'train_trip.id']).orderBy('train_trip.initial_departure', 'desc').limit(30)
    for (const trip of trips_db) {
        feed.item({
            title: `RegenbogenICE als ${trip.train_type} ${trip.train_number} am ${toGermanDate(DateTime.fromJSDate(trip.initial_departure))}`,
            description: `Der RegenbogenICE ist als ${trip.train_type} ${trip.train_number} am ${toGermanDate(DateTime.fromJSDate(trip.initial_departure))} zwischen ${trip.origin ? await stationNameByEva(trip.origin) : trip.origin_station ? await stationNameByEva(trip.origin_station) : '??'} und ${trip.destination ? await stationNameByEva(trip.destination) : trip.destination_station ? await stationNameByEva(trip.destination_station) : '??'} unterwegs.`,
            url: 'https://regenbogen-ice.de',
            date: trip.train_trip_timestamp,
            guid: `${trip.id}-${trip.train_type}-${trip.train_number}-${304}-${JSToISO(trip.initial_departure)}`
        })
    }
    const xml = feed.xml()
    res.set('Content-Type', 'text/xml')
    res.send(xml)
}))

app.get('/rss/:stationName', expressAsyncHandler(async (req, res) => {
    const evas = await stationEvaByName(req.params.stationName, 1)
    if (evas.length == 0) {
        res.status(400).send(`Station ${req.params.stationName} could not be found.`)
        return
    }
    const eva = evas[0]
    const feed = new RSS({
        title: `Wann ist der RegenbogenICE in ${eva.name}?`,
        feed_url: 'https://regenbogen-ice.de/rss',
        site_url: 'https://regenbogen-ice.de',
        image_url: 'https://regenbogen-ice.de/images/twittercard.png',
    })
    const train_vehicle = await database('train_vehicle').where({ train_type: 'ICE', train_vehicle_number: 304 }).first()
    const trips_db = await database('train_trip_vehicle').where({ train_vehicle_id: train_vehicle.id })
        .join('train_trip', 'train_trip_vehicle.train_trip_id', '=', 'train_trip.id')
        .select(['train_trip_vehicle.group_index', 'train_trip_vehicle.origin', 'train_trip_vehicle.destination', 'train_trip_vehicle.timestamp', 'train_trip.train_type','train_trip.train_number', 'train_trip.origin_station', 'train_trip.destination_station', 'train_trip.initial_departure', 'train_trip.timestamp as train_trip_timestamp', 'train_trip.id']).orderBy('train_trip.initial_departure', 'desc').limit(30)
    for (const trip of trips_db) {
        const routes = await database('train_trip_route').where({ train_trip_id: trip.id }).select(['id', 'station', 'scheduled_arrival', 'scheduled_departure', 'cancelled'])
        for (const route of routes) {
            if (!route.cancelled && route.station == eva.evaNumber) {
                feed.item({
                    title: `RegenbogenICE als ${trip.train_type} ${trip.train_number} am ${toGermanDate(DateTime.fromJSDate(route.scheduled_arrival || route.scheduled_departure))}`,
                    description: `Der RegenbogenICE ist als ${trip.train_type} ${trip.train_number} am ${toGermanDate(DateTime.fromJSDate(route.scheduled_arrival || route.scheduled_departure))} in ${eva.name}. Bitte prüfe die Informationen vor Ankunft erneut.`,
                    guid: `${trip.id}-${route.id}-${trip.train_type}-${trip.train_number}-${304}-${JSToISO(trip.initial_departure)}-${JSToISO(route.scheduled_arrival || route.scheduled_departure)}`,
                    url: 'https://regenbogen-ice.de',
                    date: trip.timestamp
                })
            }
        }
    }
    const xml = feed.xml()
    res.set('Content-Type', 'text/xml')
    res.send(xml)
}))