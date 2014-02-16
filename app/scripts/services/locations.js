angular.module("travelPlanningGame.app")
	.factory("locations", function($http, $q, resources, history) {

		// Source files
		var source_landmarks = "../landmarks.json";
		var source_cities = "../cities.json";

		// List of landmarks and cities
		var landmarks = null;
		var cities = null;

		// Fetch landmarks
		function loadLandmarks() {
			var deferred = $q.defer();

			if (!landmarks) {
				$http.get(source_landmarks)
					.success(function(data) {
						// Fulfill promise on success
						landmarks = data;
						// Process each landmark
						angular.forEach(landmarks, function(landmark, index) {
							// Prepare a resource tracker
							landmark.resources = fillLandmarkResources(landmark);

							// Assign an id
							landmark.id = "landmark" + index;

							// Provide a way to check if the landmark has been visited
							landmark.isVisited = isVisited(landmark, "landmarks");
						});
						deferred.resolve(landmarks);
					})
					.error(function(data) {
						// Reject with failure
						deferred.reject();
					});
			} else {
				deferred.resolve(landmarks);
			}

			return deferred.promise;
		}

		// Fetch cities
		function loadCities() {
			var deferred = $q.defer();

			if (!cities) {
				$http.get(source_cities)
					.success(function(data) {
						// Fulfill promise on success
						cities = data;
						// Process each city
						angular.forEach(cities, function(city, index) {
							// Prepare a resource tracker
							city.resources = resources.new();

							// Assign an id
							city.id = "city" + index;

							// Provide a way to check if the city has been visited
							city.isVisited = isVisited(city, "cities");
						});
						deferred.resolve(cities);
					})
					.error(function(data) {
						// Reject with failure
						deferred.reject();
					});
			} else {
				deferred.resolve(cities);
			}

			return deferred.promise;
		}

		// Add resource trackers to each landmark
		function fillLandmarkResources(landmark) {
			var resourceTracker = resources.new();

			// Landmark resources: visitingCost, lodgingCost, visitingExp, souvenirs, souvenirCost, exp
			resourceTracker.set(resources.categories.VISITING, resources.types.MONEY, -1 * landmark.visitingCost);
			resourceTracker.set(resources.categories.LODGING, resources.types.MONEY, -1 * landmark.lodgingCost);
			resourceTracker.set(resources.categories.VISITING, resources.types.XP, landmark.visitingExp);
			resourceTracker.set(resources.categories.SHOPPING, resources.types.SOUVENIR, landmark.shopping.souvenirs);
			resourceTracker.set(resources.categories.SHOPPING, resources.types.MONEY, -1 * landmark.shopping.cost);
			resourceTracker.set(resources.categories.DISCOVERY, resources.types.XP, landmark.exp);

			return resourceTracker;
		}

		// Add empty resource trackers to each city
		function fillCityResources(city) {
			var resourceTracker = resources.new();

			// Similar to landmark resources: visitingCost, lodgingCost, visitingExp, souvenirs, souvenirCost, exp
			resourceTracker.set(resources.categories.VISITING, resources.types.MONEY, 0);
			resourceTracker.set(resources.categories.LODGING, resources.types.MONEY, 0);
			resourceTracker.set(resources.categories.VISITING, resources.types.XP, 0);
			resourceTracker.set(resources.categories.SHOPPING, resources.types.SOUVENIR, 0);
			resourceTracker.set(resources.categories.SHOPPING, resources.types.MONEY, 0);
			resourceTracker.set(resources.categories.DISCOVERY, resources.types.XP, 0);

			return resourceTracker;
		}

		function isVisited(location, historyRecord) {
			return function() {
				return history.getInstance(historyRecord).find(location) !== null;
			};
		}

		return {
			getLandmarks: loadLandmarks
			, getCities: loadCities
		};
	});
