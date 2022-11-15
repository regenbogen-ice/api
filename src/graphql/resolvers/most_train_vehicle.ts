import database from '../../database.js'
import { TRAIN_VEHICLE_SELECTS } from '../sql_selects.js'

export const mostTrainVehicleTrainVehicle = async (parent: any) => {
    return await database('train_vehicle').where({ id: parent.train_vehicle_id }).select(TRAIN_VEHICLE_SELECTS).first()
}