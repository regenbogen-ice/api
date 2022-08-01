import expressAsyncHandler from 'express-async-handler';
import database from '../../database.js';
import { app } from '../webserver.js';

type TrainVehicle = { guess: string, type: string }

const getSortedAutoCompleteList = (searchTerm: string, possibilities: TrainVehicle[]) => {
    const lowerSearchTerm = searchTerm.toLowerCase()
    const values: any[][] = possibilities.map(guess => {
        const lowerGuess = guess.guess.toLowerCase()
        const limit = Math.max(lowerGuess.length, lowerSearchTerm.length)
        let score = 0, highscore = 0
        for(let i = 0; i < limit; i++) {
            if(!lowerGuess[i] || !lowerSearchTerm[score]) {
                break
            }
            if(lowerGuess[i] === lowerSearchTerm[score]) {
                score++
                if(score > highscore) {
                    highscore = score
                }
            } else {
                score = 0
            }
        }
        return [highscore / limit, guess]
    })
    const sorted = values.sort((a,b) => b[0]-a[0])
    return sorted.map(elem => elem[1])
}

app.get('/api/autocomplete/:searchTerm', expressAsyncHandler(async (req, res) => {
    const searchTerm = req.params.searchTerm
    const version = parseInt(req.query.version as string || '1')
    let possibilities = []
    if (Number(searchTerm)) {
        possibilities = (await database('train_vehicle').where('train_vehicle_number', 'like', `%${searchTerm}%`).select(['train_vehicle_number', 'train_type'])).map(v => ({ guess: String(v.train_vehicle_number), type: v.train_type }))
    } else {
        possibilities = getSortedAutoCompleteList(searchTerm, (await database('train_vehicle').whereRaw('LOWER(train_vehicle_name) like ?', [`%${searchTerm}%`]).select(['train_vehicle_name', 'train_type']).limit(100)).map(v => ({ guess: v.train_vehicle_name, type: v.train_type })))
    }
    if (version == 1) {
        res.json(possibilities.map(p => p.guess))
    } else {
        res.json(possibilities)
    }
}))