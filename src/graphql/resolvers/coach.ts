import database from '../../database.js'
import limitParser from '../../limitParser.js'

export const coachCoachSequenceQuery = async (parent: any) => {
    return await database('coach_sequence').where({ id: parent.coach_sequence_id }).select('*').first()
}

export const coachCoachLinksQuery = async (parent: any, args : { identification_number?: string, limit?:number }) => {
    let sql = database('train_trip_coaches_identification').where({ coach_id: parent.id })
        .join('train_trip', 'train_trip.id', '=', 'train_trip_coaches_identification.train_trip_id')
        .select(['train_trip_coaches_identification.id', 'train_trip_coaches_identification.train_trip_id', 'train_trip_coaches_identification.coach_id', 'train_trip_coaches_identification.identification_number'])
        .orderBy('train_trip.initial_departure', 'desc')
    if (args.identification_number) {
        sql = sql.where({ identification_number: args.identification_number })
    }
    return await sql.limit(limitParser('coach_links', args.limit))
}