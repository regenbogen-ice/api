import { DateTime } from 'luxon'

export const fromMarudorTimestamp = (marudorTimestamp: string) => DateTime.fromISO(marudorTimestamp)
export const toMarudorTimestamp = (timestamp: DateTime) => timestamp.toISO()
export const fromSQLTimestamp = (sqlTimestamp: string) => DateTime.fromFormat(sqlTimestamp, 'yyyy-LL-dd hh:mm:ss', { zone: 'UTC' })
export const toSQLTimestamp = (timestamp: DateTime) => timestamp.setZone('UTC').toFormat('yyyy-LL-dd hh:mm:ss')
export const marudorToSQL = (marudorTimeStamp: string) => toSQLTimestamp(fromMarudorTimestamp(marudorTimeStamp))
export const JSToISO = (jsDate: Date) => DateTime.fromJSDate(jsDate).setZone('UTC').toISO()
export const toGermanDate = (date: DateTime) => date.toLocal().toFormat('dd.LL. HH:mm')