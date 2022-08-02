import register from "../../helpers/register.js";
import v1 from "./v1.js";

// deprecated
register('GET', '/train_vehicle', { query: {
    q: { type: 'string', required: true },
    train_type: { type: 'string', default: 'ICE' },
    coach_sequence_limit: { type: 'number', default: '0' },
    include_coaches: { type: 'boolean', default: 'true' },
    trip_limit: { type: 'number', default: '0' },
    include_routes: { type: 'boolean', default: 'true' },
    include_marudor_link: { type: 'boolean', default: 'false' },
}}, v1)


register('GET', '/v1/train_vehicle', { query: {
    q: { type: 'string', required: true },
    train_type: { type: 'string', default: 'ICE' },
    coach_sequence_limit: { type: 'number', default: '0' },
    include_coaches: { type: 'boolean', default: 'true' },
    trip_limit: { type: 'number', default: '0' },
    include_routes: { type: 'boolean', default: 'true' },
    include_marudor_link: { type: 'boolean', default: 'false' },
}}, v1)
