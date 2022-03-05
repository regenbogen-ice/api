import expressAsyncHandler from 'express-async-handler';
import { app } from '../webserver.js';
import RSS from 'rss'
import database from '../../database.js';
import { JSToISO, toGermanDate } from '../../dateTimeFormats.js';
import { DateTime } from 'luxon';
import { stationNameByEva } from '../../evaFetch.js';

app.get('/rss', expressAsyncHandler(async (req, res) => {
    const feed = new RSS({
        title: 'Wo ist der RegenbogenICE?',
        feed_url: 'https://regenbogen-ice.de/rss',
        site_url: 'https://regenbogen-ice.de',
        image_url: 'https://regenbogen-ice.de/images/twittercard.png',
    })

    const train_vehicle = await database('train_vehicle').where({ train_vehicle_number: 304 }).first()
    const trips_db = await database('train_trip_vehicle').where({ train_vehicle_id: train_vehicle.id })
        .join('train_trip', 'train_trip_vehicle.train_trip_id', '=', 'train_trip.id')
        .select(['train_trip_vehicle.group_index', 'train_trip_vehicle.timestamp', 'train_trip.train_type','train_trip.train_number', 'train_trip.origin_station', 'train_trip.destination_station', 'train_trip.initial_departure', 'train_trip.timestamp as train_trip_timestamp', 'train_trip.id']).orderBy('train_trip.initial_departure', 'desc').limit(30)
    for (const trip of trips_db) {
        feed.item({
            title: `RegenbogenICE als ${trip.train_type} ${trip.train_number} am ${toGermanDate(DateTime.fromJSDate(trip.initial_departure))}`,
            description: `Der RegenbogenICE ist als ${trip.train_type} ${trip.train_number} am ${toGermanDate(DateTime.fromJSDate(trip.initial_departure))} zwischen ${trip.origin_station ? await stationNameByEva(trip.origin_station) : '??'} und ${trip.destination_station ? await stationNameByEva(trip.destination_station) : '??'} unterwegs.`,
            url: 'https://regenbogen-ice.de',
            date: trip.train_trip_timestamp,
            guid: `${trip.id}-${trip.train_type}-${trip.train_number}-${304}-${JSToISO(trip.initial_departure)}`
        })
    }
    const xml = feed.xml()
    res.set('Content-Type', 'text/xml')
    res.send(xml)
}))