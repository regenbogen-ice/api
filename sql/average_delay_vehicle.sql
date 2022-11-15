SELECT AVG(train_trip_route.arrival_delay) as average FROM train_trip_route
    JOIN train_vehicle ON train_vehicle.id = ?
    JOIN train_trip_vehicle ON train_trip_vehicle.train_vehicle_id = train_vehicle.id
    JOIN train_trip ON  train_trip.id = train_trip_vehicle.train_trip_id
WHERE train_trip_route.train_trip_id = train_trip.id AND train_trip.initial_departure > ? AND train_trip_route.arrival_delay is NOT NULL