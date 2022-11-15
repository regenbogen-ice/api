import fetch, { Response } from 'node-fetch'
import staticConfig from './staticConfig.js'
import redis from './redis.js'

type StopPlaceResponse = { evaNumber: string, name: string, availableTransports: string[] }
type StopPlaceSearchResponse = StopPlaceResponse[]

const handleResponse = async (path: string, response: Response, ignoredStatusCodes?: number[]): Promise<any | null> => {
    if (response.status != 200 && response.status != 204 && (!ignoredStatusCodes || !ignoredStatusCodes.includes(response.status)))
        throw new Error(`Error while fetching ${path}: Status code: ${response.status}: ${await response.json()}`)
    if (response.status == 200)
        return await response.json()
}

export const stationNameByEva = async (evaNumber: number): Promise<string> => {
    const path = staticConfig.BAHN_EXPERT_URL + `/stopPlace/v1/${evaNumber}`
    const redisResponse = await redis.get(`eva_${evaNumber}`)
    if (redisResponse)
        return redisResponse
    const response: StopPlaceResponse = await handleResponse(path, await fetch(path))
    redis.set(`eva_${evaNumber}`, response.name)
    return response.name
}

export const stationEvaByName = async (searchTerm: string, length: number): Promise<{ evaNumber: number, name: string }[]> => {
    const path = staticConfig.BAHN_EXPERT_URL + `/stopPlace/v1/search/${searchTerm}?max=${length * 2}`
    const redisResponse = await redis.get(`eva_search_${searchTerm}_${length}`)
    if (redisResponse)
        return JSON.parse(redisResponse)
    const response: StopPlaceSearchResponse = await handleResponse(path, await fetch(path))
    const r = response.filter(r => r.availableTransports.includes("HIGH_SPEED_TRAIN")).map(r => ({ evaNumber: +r.evaNumber, name: r.name })).slice(0, length)
    redis.set(`eva_search_${searchTerm}`, JSON.stringify(r))
    return r
}