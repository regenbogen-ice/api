import database from '../../database.js'

export const coachCoachSequenceQuery = async (parent: any) => {
    return await database('coach_sequence').where({ id: parent.coach_sequence_id }).select('*').first()
}

export const coachCoachLinksQuery = async (parent: any, args : { identification_number?: string }) => {
    let sql = database('train_trip_coaches_identification').where({ coach_id: parent.id })
    if (args.identification_number) {
        sql = sql.where({ identification_number: args.identification_number })
    }
    return await sql.limit(40)
}