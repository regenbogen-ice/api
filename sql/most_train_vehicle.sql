SELECT COUNT(train_vehicle.id) as count, train_vehicle.id as train_vehicle_id FROM train_vehicle
	JOIN train_trip_vehicle ON train_trip_vehicle.train_trip_id = ?
WHERE train_vehicle.id=train_trip_vehicle.train_vehicle_id GROUP BY train_vehicle.id ORDER BY COUNT(train_vehicle.id) DESC LIMIT ?