angular.module("travelPlanningGame.app")
	.factory("landmarks", function($http, $q, resources) {

		// Landmark file
		var source = "landmarks.json";

		// List of landmarks
		var landmarks = null;

		// Fetch landmarks
		function load() {
			var deferred = $q.defer();

			if(!landmarks) {
				$http.get(source)
				.success(function(data) {
					// Fulfill promise on success
					landmarks = data;
					angular.forEach(landmarks, function(landmark, index) {
						landmark.resources = createResourceTracker(landmark);
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

		// Add resource trackers to each landmark
		function createResourceTracker(landmark) {
			var resourceTracker = resources.new();

			// Landmark resources: visitingCost, lodgingCost, visitingExp, souvenirs, souvenirCost, exp
			resourceTracker.subtract(resources.categories.VISITING, resources.types.MONEY, landmark.visitingCost);
			resourceTracker.subtract(resources.categories.LODGING, resources.types.MONEY, landmark.lodgingCost);
			resourceTracker.add(resources.categories.VISITING, resources.types.XP, landmark.visitingExp);
			resourceTracker.add(resources.categories.SHOPPING, resources.types.SOUVENIR, landmark.souvenirs);
			resourceTracker.subtract(resources.categories.SHOPPING, resources.types.MONEY, landmark.souvenirCost);
			resourceTracker.add(resources.categories.ONETIME, resources.types.XP, landmark.exp);

			return resourceTracker;
		}

		return {
			get: load
		};
	});
