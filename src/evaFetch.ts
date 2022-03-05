import fetch, { Response } from 'node-fetch'
import staticConfig from './staticConfig.js'
import redis from './reddis.js'

type StopPlaceResponse = { evaNumber: string, name: string }
type StopPlaceSearchResponse = StopPlaceResponse[]

const handleResponse = async (path: string, response: Response, ignoredStatusCodes?: number[]): Promise<any | null> => {
    if (response.status != 200 && response.status != 204 && (!ignoredStatusCodes || !ignoredStatusCodes.includes(response.status)))
        throw new Error(`Error while fetching ${path}: Status code: ${response.status}: ${await response.json()}`)
    if (response.status == 200)
        return await response.json()
}

export const stationNameByEva = async (evaNumber: number) => {
    const path = staticConfig.MARUDOR_URL + `/stopPlace/v1/${evaNumber}`
    const redisResponse = await redis.get(`eva_${evaNumber}`)
    if (redisResponse)
        return redisResponse
    const response: StopPlaceResponse = await handleResponse(path, await fetch(path))
    redis.set(`eva_${evaNumber}`, response.name)
    return response.name
}

export const stationEvaByName = async (searchTerm: string) => {
    const path = staticConfig.MARUDOR_URL + `/stopPlace/v1/search${searchTerm}`
    const redisResponse = await redis.get(`eva_search_${searchTerm}`)
    if (redisResponse)
        return +redisResponse
    const response: StopPlaceSearchResponse = await handleResponse(path, await fetch(path))
    redis.set(`eva_search_${searchTerm}`, response[0].evaNumber)
    return response[0].evaNumber
}