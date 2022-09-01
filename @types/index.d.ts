export type TrainStop = {
    cancelled: boolean,
    station: string,
    scheduled_departure: string | null, // date-time
    departure: string | null, // date-time
    scheduled_arrival: string | null, // date-time
    arrival: string | null, // date-time
}

export type TrainTrip = {
    group_index: number,
    train_number: number,
    train_type: string,
    origin_station: string | null,
    destination_station: string | null,
    initial_departure: string, // date-time
    trip_timestamp: string, // date-time
    vehicle_timestamp: string, // date-time
    marudor?: string,
    stops?: Array<TrainStop>
    train_vehicle?: TrainVehicle
}

export type TrainCoach = {
    index: number,
    class: number,
    type: string,
    uic: string,
    category: string
}

export type TrainCoachSequence = {
    timestamp: string, // date-time
    coaches?: Array<Coach>
}

export type TrainVehicle = {
    name: string | null,
    building_series: number | null,
    number: number,
    train_type: string,
    trips?: Array<TrainTrip>,
    coach_sequences?: Array<CoachSequence>
}

export type StationSearchResponse = Array<{ evaNumber: number, name: string }>

export type AutoCompleteResponse = Array<AutoCompleteSuggestion>
export type AutoCompleteSuggestion = { guess: string, type: string, train_type: string }

// deprecated autocomplete

export type AutoCompleteResponseV1 = Array<string>