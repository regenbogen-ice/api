type TrainVehicle = { guess: string, [key: string]: any }

export const getSortedAutoCompleteList = (searchTerm: string, possibilities: TrainVehicle[]) => {
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