import register from '../../helpers/register.js';
import v1 from './v1.js';

// deprecated
register('GET', '/stationSearch/:q', {
    params: { q: { type: 'string', required: true } },
    query: { length: { type: 'number', default: '5' } }
}, v1)

register('GET', '/v1/station_search/:q', {
    params: { q: { type: 'string', required: true } },
    query: { length: { type: 'number', default: '5' } }
}, v1)