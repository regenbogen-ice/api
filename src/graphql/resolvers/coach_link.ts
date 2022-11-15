import database from '../../database.js'

export const coachLinkTrainTripQuery = async (parent: any) => {
    return await database('train_trip').where({ id: parent.train_trip_id }).first()
}

export const coachLinkCoachQuery = async (parent: any) => {
    return await database('coach').where({ id: parent.coach_id }).first()
}