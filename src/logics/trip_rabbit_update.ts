import { DateTime } from 'luxon'
import { JSToISO } from '../dateTimeFormats.js'
import { rabbit } from '../rabbit.js'

const trip_rabbit_updates = async (trip: any) => {
    if (trip.coach_sequence_update_expire && DateTime.fromJSDate(trip.initial_departure).plus({ days: 2 }) > DateTime.now() && DateTime.fromJSDate(trip.coach_sequence_update_expire) < DateTime.now()) {
        rabbit.publish('fetch_coach_sequence', {
            trainId: trip.id,
            trainNumber: trip.train_number,
            trainType: trip.train_type,
	    initialDeparture: JSToISO(trip.initial_departure),
            evaDeparture: JSToISO(trip.initial_departure),
            evaNumber: trip.origin_station
        })
    }
}
export default trip_rabbit_updates
