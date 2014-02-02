angular.module("travelPlanningGame.app")
	.factory("randomEvents", function($q, $http, resources) {

		// Source files
		var source_events = "../random-events.json";

		// List of random events
		var randomEvents = null;

		var occurredEventIDs = [];
		var availableEventIDs = [];

		// Total count of events occurred
		var occurrenceCountTotal = 0;

		// Fetch events
		function loadEvents() {
			var deferred = $q.defer();

			if (!randomEvents) {
				$http.get(source_events)
					.success(function(data) {
						// Fulfill promise on success
						randomEvents = data;
						// Process each event
						angular.forEach(randomEvents, function(randomEvent, index) {
							// Prepare a resource tracker
							randomEvent.resources = _fillEventResources(randomEvent);

							// Assign an id
							randomEvent.id = "randomEvent" + index;
							availableEventIDs.push(index);

							// Track the number of times we've shown it
							randomEvent.occurrenceCount = 0;
						});
						deferred.resolve(randomEvents);
					})
					.error(function(data) {
						// Reject with failure
						deferred.reject();
					});
			} else {
				deferred.resolve(randomEvents);
			}

			return deferred.promise;
		}

		function getRandomEvent() {
			_fillAvailableEvents();

			// Pick one randomly
			var index = Math.floor(Math.random() * availableEventIDs.length);

			// The index may not correspond one-to-one with the indices of the available event IDs
			// because we may have moved them to occurred event IDs
			// Hence, iterate n = index times to fetch the n-th available ID
			var randomEventID = null;
			var cumulativeIndex = 0, matchingAvailableEventsIndex;
			angular.forEach(availableEventIDs, function(eventID, availableEventsIndex) {
				cumulativeIndex++;
				if(cumulativeIndex === index) {
					randomEventID = eventID;
					matchingAvailableEventsIndex = availableEventsIndex;
				}
			});

			if(randomEventID) {
				delete availableEventIDs[matchingAvailableEventsIndex];
				occurredEventIDs.push(randomEventID);

				randomEvents[randomEventID].occurrenceCount++;
				occurrenceCountTotal++;

				return randomEvents[randomEventID];
			}

			else
				return null;
		}


		function _fillAvailableEvents() {
			if(!availableEventIDs || !availableEventIDs.length)
				availableEventIDs = angular.copy(occurredEventIDs);
		}

		// Add resource trackers to each landmark
		function _fillEventResources(randomEvent) {
			var resourceTracker = resources.new();

			// Event resource based on impact
			resourceTracker.set(resources.categories.ALL
				, resources.types[randomEvent.resource]
				, randomEvent.amount);

			return resourceTracker;
		}

		function randomYes() {
			return Math.random() <= 0.3;
		}

		return {
			load: loadEvents
			, hasOccurred: randomYes
			, getEvent: getRandomEvent
		};
	});
