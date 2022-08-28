import database from '../../database.js'

export const coachSequenceCoachesQuery = async (parent: any) => {
    return await database('coach').where({ coach_sequence_id: parent.id }).select('*')
}

export const coachSequenceTrainVehicleQuery = async (parent: any) => {
    return await database('train_vehicle').where({ id: parent.train_vehicle_id }).select('*').first()
}