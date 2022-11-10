export default {
    MARUDOR_URL: 'https://marudor.de/api',
    API_PATH: '/api',
    RETURN_LIMIT: {
        train_trips: { default: 5, max: 500 },
        coach_sequence: { default: 1, max: 20 },
        coaches: { default: 1, max: 50 },
        most_stations: { default: 10, max: 50},
    }
}