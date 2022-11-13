import { DateTime, Duration, DurationLike } from 'luxon'

export const fromMarudorTimestamp = (marudorTimestamp: string) => DateTime.fromISO(marudorTimestamp)
export const toMarudorTimestamp = (timestamp: DateTime) => timestamp.toISO()
export const fromSQLTimestamp = (sqlTimestamp: string) => DateTime.fromFormat(sqlTimestamp, 'yyyy-LL-dd hh:mm:ss', { zone: 'UTC' })
export const toSQLTimestamp = (timestamp: DateTime) => timestamp.setZone('UTC').toFormat('yyyy-LL-dd hh:mm:ss')
export const marudorToSQL = (marudorTimeStamp: string) => toSQLTimestamp(fromMarudorTimestamp(marudorTimeStamp))
export const JSToISO = (jsDate: Date) => DateTime.fromJSDate(jsDate).setZone('UTC').toISO()
export const toGermanDate = (date: DateTime) => date.toLocal().toFormat('dd.LL. HH:mm')

export const timestampFromSince = (since: string): DateTime => {
    let type = since[since.length - 1]
    let d = Number(since.slice(0, -1))
    if (!isNaN(Number(type))) {
        type = 'd'
        d = Number(since)
    }
    if (isNaN(d))  {
        throw new Error(`Since ${since} is not parseable.`)
    }
    let duration: DurationLike = {}
    switch(type) {
        case 'd': duration['days'] = d; break
        case 'w': duration['weeks'] = d; break
        case 'm': duration['months'] = d; break
        case 'y': duration['years'] = d; break
        default: throw new Error(`Since ${since} is not parseable. Type ${d} is not known.`)
    }
    // maximum is 1 year
    if (Duration.fromDurationLike(duration).as('days') > 365) {
        duration = { years: 1 }
    }
    return DateTime.now().minus(duration)
}