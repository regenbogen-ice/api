import database from '../../database.js'

export const coachCoachSequenceQuery = async (parent: any) => {
    return await database('coach_sequence').where({ id: parent.coach_sequence_id }).select('*').first()
}