angular.module("travelPlanningGame.app")
	.factory("landmarks", function($http, $q, resources) {

		// Source files
		var source_landmarks = "../../landmarks.json";
		var source_cities = "../../cities.json";

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
							landmark.resources = createResourceTracker(landmark);

							// Assign an id
							landmark.id = index;
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
		function createResourceTracker(landmark) {
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

		return {
			get: loadLandmarks
			, getCities: loadCities
		};
	});
