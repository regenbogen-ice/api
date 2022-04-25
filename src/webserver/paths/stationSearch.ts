import expressAsyncHandler from 'express-async-handler';
import { stationEvaByName } from '../../evaFetch.js';
import { app } from '../webserver.js';

app.get('/api/stationSearch/:searchTerm', expressAsyncHandler(async (req, res) => {
    const { searchTerm } = req.params
    const length = parseInt((req.query.length || '5').toString())
    if (!searchTerm || !length) {
        res.status(400).send('Bad Request')
        return
    }
    res.json(await stationEvaByName(searchTerm, length))
}))