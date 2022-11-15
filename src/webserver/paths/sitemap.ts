import expressAsyncHandler from 'express-async-handler'
import { app } from '../webserver.js'
import { SitemapStream, streamToPromise } from 'sitemap'
import { Readable } from 'stream'
import database from '../../database.js'
import { toSQLTimestamp } from '../../dateTimeFormats.js'
import redis from '../../redis.js'
import { DateTime } from 'luxon'

type SitemapEntry = {
    url: string,
    changefreq?: string,
    priority?: number,
}

const getTripEntries = async () => {
    const trips = await database('train_trip')
        .groupBy(['train_number', 'train_type'])
        //.whereRaw('MAX(initial_departure) < ?', [toSQLTimestamp(DateTime.now().minus({ months: 6 }))])
        .select(['train_number', 'train_type'])

    return trips.map(trip => ({
        url: `/trip/${trip.train_type}/${trip.train_number}`,
        priority: 0.4,
        changefreq: 'always',
    }))
}

const getVehicleEntries = async () => {
    const vehicles = await database('train_vehicle')
        .groupBy(['train_vehicle_number', 'train_type'])
        .select(['train_vehicle_number', 'train_vehicle_name', 'train_type'])

    return vehicles.map(vehicle => ({
        url: `/vehicle/${vehicle.train_type}/${encodeURIComponent(vehicle.train_vehicle_name || vehicle.train_vehicle_number)}`,
        priority: vehicle.train_vehicle_name ? 0.5 : 0.3,
        changefreq: 'always',
    }))
}

const getCoachEntries = async () => {
    const coaches = await database('coach').groupBy('uic').select('uic')

    return coaches.map(coach => ({
        url: `/coach/${coach.uic}`,
        priority: 0.2,
        changefreq: 'always',
    }))
}

const generateSitemap = async (hostname: string) => {
    const sitemapStream = new SitemapStream({ hostname: 'https://' + hostname + '/' })
    
    const dynamicEntries = (await Promise.all([
        getTripEntries(),
        getVehicleEntries(),
        getCoachEntries(),
    ])).flat(1)
 
    const links: SitemapEntry[] = [
        {url: '/', priority: 1, changefreq: 'always'},
        ...dynamicEntries,
    ]
    
    const data = await streamToPromise(Readable.from(links).pipe(sitemapStream))
    return data.toString()
}

app.get('/sitemap.xml', expressAsyncHandler(async (req, res) => {
    res.contentType('application/xml')
    const redis_key = `sitemap_${req.hostname}`
    let sitemap = await redis.get(redis_key)
    if (!sitemap || process.env.DISABLE_SITEMAP_REDIS == 'true'){
        sitemap = await generateSitemap(req.hostname)
        await redis.set(redis_key, sitemap,  { EX: 60 * 60 })
    }
    res.send(sitemap)
}))
