SELECT AVG(train_trip_route.arrival_delay) as average FROM train_trip_route
    JOIN train_trip ON train_trip.id = ?
WHERE train_trip_route.train_trip_id = train_trip.id AND train_trip.initial_departure > ? AND train_trip_route.arrival_delay is NOT NULL