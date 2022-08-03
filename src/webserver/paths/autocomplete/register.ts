import register from "../../helpers/register.js";
import v1 from "./v1.js";
import v2 from "./v2.js";

// deprecated
register('GET', '/autocomplete/:q', { params: { q: {type: 'string', required: true }} }, v1)

register('GET', '/v1/autocomplete/:q', { params: { q: {type: 'string', required: true }} }, v1)
register('GET', '/v2/autocomplete/:q', { params: {
    q: { type: 'string', required: true } },
    query: { types: { type: 'list', default: 'train_vehicle,train_type,coach'} }
}, v2)