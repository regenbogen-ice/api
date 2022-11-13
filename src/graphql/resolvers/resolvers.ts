import { dateTimeScalar } from '../scalars/date_times.js';
import { evaNumberScalar } from '../scalars/eva_number.js';
import { listScalar } from '../scalars/list.js';
import { sinceScalar } from '../scalars/since.js';
import { coachCoachLinksQuery, coachCoachSequenceQuery } from './coach.js';
import { coachLinkCoachQuery, coachLinkTrainTripQuery } from './coach_link.js';
import { coachSequenceCoachesQuery, coachSequenceTrainVehicleQuery } from './coach_sequence.js';
import { mostTrainVehicleTrainVehicle } from './most_train_vehicle.js';
import { autocompleteQuery, coachQuery, trainTripQuery, trainVehicleQuery } from './query.js';
import { trainTripAverageDelay, trainTripMostTrainVehicles, trainVehicleAverageDelay } from './statistics.js';
import { trainTripBahnExpertQuery, trainTripCoachLinksQuery, trainTripStopsQuery, trainTripVehiclesQuery } from './train_trip.js';
import { trainVehicleCoachSequencesQuery, trainVehicleTrainTypeQuery, trainVehicleTripsQuery, mostStationsQuery } from './train_vehicle.js';

export default {
    EvaNumber: evaNumberScalar,
    DateTime: dateTimeScalar,
    List: listScalar,
    Since: sinceScalar,
    Query: {
        train_vehicle: trainVehicleQuery,
        train_trip: trainTripQuery,
        coach: coachQuery,
        autocomplete: autocompleteQuery
    },
    TrainVehicle: {
        train_type: trainVehicleTrainTypeQuery,
        trips: trainVehicleTripsQuery,
        coach_sequences: trainVehicleCoachSequencesQuery,
        most_stations: mostStationsQuery,
        average_delay: trainVehicleAverageDelay
    },
    TrainTrip: {
        stops: trainTripStopsQuery,
        train_vehicles: trainTripVehiclesQuery,
        bahn_expert: trainTripBahnExpertQuery,
        coach_links : trainTripCoachLinksQuery,
        average_delay: trainTripAverageDelay,
        most_train_vehicles: trainTripMostTrainVehicles,
    },
    CoachSequence: {
        coaches: coachSequenceCoachesQuery,
        train_vehicle: coachSequenceTrainVehicleQuery
    },
    Coach: {
        coach_sequence: coachCoachSequenceQuery,
        coach_links: coachCoachLinksQuery
    },
    CoachLink: {
        trip: coachLinkTrainTripQuery,
        coach: coachLinkCoachQuery
    },
    MostTrainVehicle: {
        train_vehicle: mostTrainVehicleTrainVehicle
    }
}