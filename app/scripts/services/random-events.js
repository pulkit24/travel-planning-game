angular.module("travelPlanningGame.app")
	.factory("randomEvents", function($q, $http, resources, upgrades) {

		// Source files
		var source_events = "../random-events.json";

		// List of random events
		var randomEvents = {};
		var randomEventsCount = 0;

		// Fetch events
		function loadEvents() {
			var deferred = $q.defer();

			if (!randomEventsCount) {
				$http.get(source_events)
					.success(function(data) {
						// Fulfill promise on success
						randomEventsCount = data.length;

						// Process each event
						angular.forEach(data, function(randomEvent, index) {
							// Prepare a resource tracker
							randomEvent.resources = _fillEventResources(randomEvent);

							// Assign an id
							randomEvent.id = "randomEvent" + index;

							// Track the number of times we've shown it
							randomEvent.occurrenceCount = 0;

							randomEvents[index] = randomEvent;
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

		var demoEvents = [5, 1, 8, 12];
		var demoOccurrence = [false, true, true, true, true];

		if(!window.eventProbability) window.eventProbability = 0.67;

		function randomize(task) {
			var result;

			if(task === "pickEvent")
				result = (window.isDemo && demoEvents.length > 0) ? demoEvents.shift() : Math.floor(Math.random() * randomEventsCount);
			else if(task === "eventOccurred")
				result = (window.isDemo && demoOccurrence.length > 0) ? demoOccurrence.shift() : (Math.random() <= window.eventProbability);

			return result;
		}

		function getRandomEvent() {
			// Pick one randomly
			var index = randomize("pickEvent");

			if(index) {
				randomEvents[index].occurrenceCount++;
				return randomEvents[index];
			}
			else
				return null;
		}


		// function _fillAvailableEvents() {
		// 	if(!availableEventIDs || !availableEventIDs.length)
		// 		availableEventIDs = angular.copy(occurredEventIDs);
		// }

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
			return randomize("eventOccurred");
		}

		function getAvailableCounterTo(randomEvent) {
			if(!randomEvent)
				return null;

			// Get the current counters
			var counters = randomEvent.counteredBy;
			if(!angular.isArray(counters))
				counters = [counters];
			for(var i = 0, len = counters.length; i < len; i++) {
				var counter = upgrades.get(counters[i]);
				if(counter && counter.isUnlocked) {
					return counter; // if any one of the counters is already unlocked
				}
			}

			return null;
		}

		return {
			load: loadEvents
			, hasOccurred: randomYes
			, getEvent: getRandomEvent
			, getAvailableCounterTo: getAvailableCounterTo
		};
	});
