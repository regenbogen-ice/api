import expressAsyncHandler from 'express-async-handler';
import database from '../../database.js';
import { app } from '../webserver.js';

const getSortedAutoCompleteList = (searchTerm: string, possibilities: string[]) => {
    const lowerSearchTerm = searchTerm.toLowerCase()
    const values: any[][] = possibilities.map(guess => {
        const lowerGuess = guess.toLowerCase()
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
    let possibilities = []
    if (Number(searchTerm)) {
        possibilities = (await database('train_vehicle').where('train_vehicle_number', 'like', `%${searchTerm}%`).select('train_vehicle_number')).map(v => String(v.train_vehicle_number))
    } else {
        possibilities = getSortedAutoCompleteList(searchTerm, (await database('train_vehicle').whereRaw('LOWER(train_vehicle_name) like ?', [`%${searchTerm}%`]).select('train_vehicle_name').limit(100)).map(v => v.train_vehicle_name))
    }
    res.json(possibilities)
}))