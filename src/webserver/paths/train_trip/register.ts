import register from '../../helpers/register.js';
import v1 from './v1.js';

register('GET', '/v1/train_trip', { query: {
    train_number: { type: 'string', required: true },
    train_type: { type: 'string', default: 'ICE' },
    trip_limit: { type: 'number', default: '1' },
    include_marudor_link: { type: 'boolean', default: 'false' },
    include_routes: { type: 'boolean', default: 'true' },
    include_train_vehicle: { type: 'boolean', default: 'true' },
    coach_sequence_limit: { type: 'number', default: '0' },
    include_coaches: { type: 'boolean', default: 'true' },
}}, v1)
