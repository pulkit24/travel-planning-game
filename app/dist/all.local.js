'use strict';

angular.module('travelPlanningGame.maps', ['AngularGM', 'travelPlanningGame.templates']);

'use strict';

angular.module('travelPlanningGame.widgets', ['AngularGM', 'travelPlanningGame.templates']);

'use strict';

angular.module('travelPlanningGame.app', [
	'ngCookies', 'ngResource', 'ngSanitize', 'ngRoute', 'ui.bootstrap', 'angular-underscore',
	'angular-rome2rio', 'state-tracker', 'travelPlanningGame.maps', 'travelPlanningGame.widgets',
	'travelPlanningGame.templates'
])
	.config(function($routeProvider, rome2rioProvider) {
		$routeProvider.when('/', {
			templateUrl: 'views/game.html'
			, controller: 'GameCtrl'
		});

		// Configure the Rome2Rio API
		rome2rioProvider.setKey('uuSKZSEU');
		rome2rioProvider.setServer('free.rome2rio.com');
		rome2rioProvider.setResponseFormat('json');
		rome2rioProvider.setAPIVersion('1.2');
		rome2rioProvider.setCurrency('AUD');
		rome2rioProvider.setDetailLevel('street_address');
	})
	.run(function(landmarks) {
		landmarks.get();
		landmarks.getCities();
	});

angular.module("travelPlanningGame.app")
	.factory("history", function() {

		///////////////////////
		// Records Manager //
		///////////////////////

		// Tracker for a single entity's history
		var History = function(serializeFn, deserializeFn) {

			if(!serializeFn)
				serializeFn = angular.toJson;
			if(!deserializeFn)
				deserializeFn = angular.fromJson;

			// History records indexed by timestamps
			this._records = {};

			// Add a record
			this.record = function addRecord(timestamp, state) {
				try {
					this._records[timestamp] = serializeFn(state);
					return true;

				} catch (e) {
					return false;
				}
			};

			// Get a record
			this.retrieve = function getRecord(timestamp) {
				try {
					var marshalledState = this._records[timestamp];
					var state = deserializeFn(marshalledState);
					return state;

				} catch (e) {
					return null;
				}
			};

			// Get all records
			this.retrieveAll = function getAllRecords() {
				var records = angular.copy(this._records);
				angular.forEach(records, function(marshalledState, timestamp) {
					records[timestamp] = deserializeFn(marshalledState);
				});
				return records;
			};

			// Find a record - a value-based lookup
			// Returns the timestamp back
			this.find = function findRecord(state) {
				var marshalledState = serializeFn(state);
				var foundTimestamp = null;

				angular.forEach(this._records, function(recordedState, timestamp) {
					if(marshalledState === recordedState)
						foundTimestamp = timestamp;
				});

				return foundTimestamp;
			};
		};

		////////////////////////////
		// Histories Manager //
		////////////////////////////

		// Registry of histories being maintained
		var registry = {};

		var _create = function createHistory(serializeFn, deserializeFn) {
			return new History(serializeFn, deserializeFn);
		};

		// Create or retrieve an existing history for the supplied name
		var getInstance = function(name, serializeFn, deserializeFn) {
			var history = registry[name];

			if (!history) {
				history = _create(serializeFn, deserializeFn);
				registry[name] = history;
			}

			return history;
		};

		return {
			getInstance: getInstance
		};
	});

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

'use strict';

angular.module('travelPlanningGame.maps')
	.factory('mapGeocoder', function($q, angulargmUtils) {
		if(!google) return;

		// Geocoder
		var geocoder = new google.maps.Geocoder();

		// Public functions
		var mapGeocoder = {};

		// Convert an address to geo coordinates
		// of the format: {lat, lng}
		// Returns a promise of the result
		mapGeocoder.toCoords = function(address) {
			var deferred = $q.defer();

			geocoder.geocode({
				address: address
			}, function(results) {
				if(results && results[0] && results[0].geometry && results[0].geometry.location)
					deferred.resolve(angulargmUtils.latLngToObj(
						results[0].geometry.location
					));
				else
					deferred.reject();
			});

			return deferred.promise;
		};

		// Convert geo coordinates back to a human-readable address
		// Coords must be of the format: {lat, lng}
		// Returns a promise of the result
		mapGeocoder.toAddress = function(coords) {
			var deferred = $q.defer();

			geocoder.geocode({
				latLng: coords
			}, function(results) {
				if(results && results[0] && results[0].formatted_address)
					deferred.resolve(results[0].formatted_address);
				else
					deferred.reject();
			});

			return deferred.promise;
		};

		return mapGeocoder;
	});

'use strict';

angular.module('travelPlanningGame.maps')
	.factory('mapRouter', function($q, $timeout, angulargmUtils, rome2rio, history) {

		//////////////////////////////
		// Get cost from Rome2Rio //
		//////////////////////////////

		function _getCost(from, to) {
			var deferred = $q.defer();

			rome2rio.search(
				from.name
				, to.name
				, rome2rio.toPosition(from.coords.lat, from.coords.lng)
				, rome2rio.toPosition(to.coords.lat, to.coords.lng)
			)
				.then(function(routes) {
					deferred.resolve(routes.cost);
				});

			return deferred.promise;
		}

		//////////////////////////////
		// Get routes from Google //
		//////////////////////////////

		// Get route for mode of travel
		// Travel modes: DRIVING, WALKING , TRANSIT
		function _getRouteByMode(from, to, mode) {
			var deferred = $q.defer();

			// Fetch route from Google
			new google.maps.DirectionsService().route({
				origin: angulargmUtils.objToLatLng(from.coords)
				, destination: angulargmUtils.objToLatLng(to.coords)
				, travelMode: google.maps.TravelMode[mode]
			}

			, function(result, status) {
				// Resolve if Google was able to find a route
				if (status === google.maps.DirectionsStatus.OK)
					deferred.resolve(result);

				// Otherwise, notify failure
				else
					deferred.reject();
			});

			return deferred.promise;
		}

		// Generic function that attempts to fetch routes
		// for different modes of travel, until we get a hit
		function _getRoute(from, to) {
			var deferred = $q.defer();

			// First attempt: default driving mode
			_getRouteByMode(from, to, "DRIVING").then(
				function hit(result) {
					deferred.resolve(result);
				}
				, function miss() {
					// Second attempt: public transit mode
					_getRouteByMode(from, to, "TRANSIT").then(
						function hit(result) {
							deferred.resolve(result);
						}
						, function miss() {
							// Third attempt: walking mode
							_getRouteByMode(from, to, "WALKING").then(
								function hit(result) {
									deferred.resolve(result);
								}
								, function miss() {
									// No more options
									deferred.reject();
								}
							);
						}
					);
				}
			);

			return deferred.promise;
		}

		/////////////////////
		// Route handler //
		/////////////////////

		var Route = function(route, cost) {
			this.route = route;
			this.cost = cost;
		};

		/////////////////////////
		// Drawing functions //
		/////////////////////////

		// Reference to the currently drawn route - used for clearing
		var renderer = null;

		function drawRoute(route, map) {
			// Initialise the renderer
			if(!renderer) {
				renderer = new google.maps.DirectionsRenderer({
					suppressMarkers: true
					, suppressInfoWindows: true
					, preserveViewport: true
					, polylineOptions: {
						clickable: false
						, strokeColor: '#3ABA3A'
						, strokeOpacity: 1.0
						, strokeWeight: 5
					}
				});
			}

			// Do we have anything to draw?
			if(route && route.route) {
				// Yes. Draw!
				renderer.setMap(map);
				renderer.setDirections(route.route);
			} else {
				// Remove the previously displayed directions, if any
				renderer.setMap(null);
			}
		}

		/////////////////////////
		// Route management //
		/////////////////////////

		// Record of all previously fetched routes - fetching is expensive!
		var routingHistory = history.getInstance("mapRouter", function(route) { return route; }, function(route) { return route; });

		// Generate a unique, commutable identifier for the route request
		function _routeIdentifier(locationA, locationB) {
			var idA = locationA.id;
			var idB = locationB.id;
			if (idA < idB)
				return idA + "," + idB;
			else
				return idB + "," + idA;
		}

		// Return a previously fetched route from history immediately
		function getRoute(from, to) {
			return routingHistory.retrieve(_routeIdentifier(from, to));
		}

		// Fetch a route, and return a promise
		function fetchRoute(from, to) {
			var deferred = $q.defer();

			$timeout(function() {
				// Check if we have previously routed these locations
				var routeHandler = routingHistory.retrieve(_routeIdentifier(from, to));

				// If so, resolve immediately
				if (routeHandler) {
					deferred.resolve(routeHandler);
				}

				// Otherwise, fetch from scratch
				else {

					// Get the route from Google
					_getRoute(from, to).then(
						function success(route) {
							// We got the route! Next, get the cost from Rome2Rio
							_getCost(from, to).then(
								function success(cost) {
									// Success again! Prepare the route object
									routeHandler = new Route(route, cost);

									// Record in history
									routingHistory.record(_routeIdentifier(from, to), routeHandler);

									// Return the route!
									deferred.resolve(routeHandler);
								}
								, function failure() {
									// Never mind the cost, just return the route
									routeHandler = new Route(route, null);

									// Record in history
									routingHistory.record(_routeIdentifier(from, to), routeHandler);

									// Return the route!
									deferred.resolve(routeHandler);
								}
							);
						}
						, function failed() {
							// Oops, no route!
							routeHandler = new Route(null, null);

							// Record in history
							routingHistory.record(_routeIdentifier(from, to), routeHandler);

							// Return the route!
							deferred.resolve(routeHandler);
						}
					);
				}
			}, 0);

			return deferred.promise;
		}

		function fetchAllRoutes(endPoints) {
			angular.forEach(endPoints, function(from, index) {
				angular.forEach(endPoints, function(to, index) {
					if (from !== to)
						fetchRoute(from, to);
				});
			});
		}

		return {
			// Route fetch functions
			prefetch: fetchAllRoutes
			, fetch: fetchRoute
			, get: getRoute

			// Route draw function
			, draw: drawRoute
		};
	});

'use strict';

angular.module('travelPlanningGame.maps')
	.factory('mapStyles', function() {

		// Collection of styles used by Google maps
		var mapStyles = {};
		mapStyles.shiftWorker = [{"stylers":[{"saturation":-100},{"gamma":1}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"on"},{"saturation":50},{"gamma":0},{"hue":"#50a5d1"}]},{"featureType":"administrative.neighborhood","elementType":"labels.text.fill","stylers":[{"color":"#333333"}]},{"featureType":"road.local","elementType":"labels.text","stylers":[{"weight":0.5},{"color":"#333333"}]},{"featureType":"transit.station","elementType":"labels.icon","stylers":[{"gamma":1},{"saturation":50}]}];
		mapStyles.routeXL = [{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"on"},{"saturation":-100},{"lightness":20}]},{"featureType":"road","elementType":"all","stylers":[{"visibility":"on"},{"saturation":-100},{"lightness":40}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"on"},{"saturation":-10},{"lightness":30}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"simplified"},{"saturation":-60},{"lightness":10}]},{"featureType":"landscape.natural","elementType":"all","stylers":[{"visibility":"simplified"},{"saturation":-60},{"lightness":60}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"},{"saturation":-100},{"lightness":60}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"},{"saturation":-100},{"lightness":60}]}];
		mapStyles.paleDawn = [{"featureType":"water","stylers":[{"visibility":"on"},{"color":"#acbcc9"}]},{"featureType":"landscape","stylers":[{"color":"#f2e5d4"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#c5c6c6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#e4d7c6"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#fbfaf7"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#c5dac6"}]},{"featureType":"administrative","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"road"},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{},{"featureType":"road","stylers":[{"lightness":20}]}];
		mapStyles.oldTimey = [{"featureType":"administrative","stylers":[{"visibility":"off"}]},{"featureType":"poi","stylers":[{"visibility":"simplified"}]},{"featureType":"road","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"simplified"}]},{"featureType":"transit","stylers":[{"visibility":"simplified"}]},{"featureType":"landscape","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"visibility":"off"}]},{"featureType":"road.local","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"color":"#84afa3"},{"lightness":52}]},{"stylers":[{"saturation":-77}]},{"featureType":"road"}];
		mapStyles.midnight = [{"featureType":"water","stylers":[{"color":"#021019"}]},{"featureType":"landscape","stylers":[{"color":"#08304b"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#000000"},{"lightness":13}]},{"featureType":"transit","stylers":[{"color":"#146474"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]}];

		return mapStyles;
	});

angular.module("travelPlanningGame.app")
	.factory("resources", function() {

		// Resource types
		var types = {};
		types.ALL = "type_all";
		types.MONEY = "type_money";
		types.XP = "type_xp";
		types.SOUVENIR = "type_souvenir";

		// Test conditions for updating these types
		var updateTests = {};
		// Money after update must not go negative
		updateTests[types.MONEY] = function(original, delta) {
			if(!original) original = 0;
			if(!delta) delta = 0;
			return original + delta >= 0;
		};
		// XP cannot go negative
		updateTests[types.XP] = function(original, delta) {
			if(!original) original = 0;
			if(!delta) delta = 0;
			return original + delta >= 0;
		};
		// Souvenirs cannot go negative
		updateTests[types.SOUVENIR] = function(original, delta) {
			if(!original) original = 0;
			if(!delta) delta = 0;
			return original + delta >= 0;
		};

		// Categories of events representing possible resource applications
		var categories = {};
		categories.ALL = "cat_all";
		categories.VISITING = "cat_visiting"; // example, visiting cost
		categories.LODGING = "cat_lodging";
		categories.SHOPPING = "cat_shopping"; // example, shopping gains
		categories.DISCOVERY = "cat_discovery"; // i.e. one-time events
		// add other categories dynamically as needed

		// Track resources for the caller
		var Resources = function() {
			// Get the value of a resource
			// Safer alternative to manually access the object properties
			this.get = function getResource(category, type) {
				if (this[category] && this[category][type])
					return this[category][type];
				else
					return 0;
			};

			// Set the value of a resource
			// Only use this at the start, to initial the resources
			// as this function doesn't impose resource validations
			this.set = function setResource(category, type, amount) {
				// Create if no prevalent track
				if (!this[category])
					this[category] = {};
				if (!this[category][type])
					this[category][type] = 0;

				this[category][type] += amount;
				return this;
			};

			// Ability to update the value of any resource
			// Checks are made to validate the update
			this.update = function updateResource(category, type, amount) {
				// Create if no prevalent track
				if (!this[category])
					this[category] = {};
				if (!this[category][type])
					this[category][type] = 0;

				// Test whether the update is possible
				if (!updateTests[type] || updateTests[type](this[category][type], amount))
					this[category][type] += amount;

				return this;
			};
			// Convenience functions for adding and subtracting amounts
			this.add = this.update;
			this.subtract = function subtractResource(category, type, amount) {
				return this.update(category, type, -1 * amount);
			};
		};

		// Create a new Resource tracker
		function startTracker() {
			return new Resources();
		}

		function duplicateTracker(tracker) {
			var trackerCopy = new Resources();
			angular.forEach(categories, function(category, index) {
				trackerCopy[category] = angular.copy(tracker[category]);
			});
			return trackerCopy;
		}

		// Check whether updating source Resources by destination Resources is possible
		function canDelta(sourceResources, sourceCategory, destinationResources, destinationCategory) {
			var possible = true;
			angular.forEach(destinationResources[destinationCategory], function(amount, type) {
				if (updateTests[type] && !updateTests[type](sourceResources[sourceCategory][type], amount))
					possible = false;
			});
			return possible;
		}

		// Update source Resources by destination Resources on supplied categories only
		function delta(sourceResources, sourceCategory, destinationResources, destinationCategory) {
			if (canDelta) {
				angular.forEach(destinationResources[destinationCategory], function(amount, type) {
					sourceResources.update(sourceCategory, type, amount);
				});
			}
		}

		return {
			new: startTracker
			, copy: duplicateTracker
			, canDelta: canDelta
			, delta: delta
			, types: types
			, categories: categories
		};
	});

angular.module("travelPlanningGame.app")
	.factory("timer", function() {

		// Times of a day
		var times = ["morning", "afternoon", "evening", "night"];
		// Utility to get the display name by number
		function toTimeOfDay(time) {
			return times[time] ? times[time] : null;
		}

		// Limits on days and times
		var limits = {};
		limits.days = 1;
		limits.times = 1; // number of "times of day" currently used by the game
		// Set the day limits and times of day to use
		function setLimits(lastDay, lastTimeOfDay) {
			limits.days = (lastDay >= 1) ? lastDay : 1;

			limits.times = (lastTimeOfDay >= 1) ? (
				(lastTimeOfDay <= times.length) ? lastTimeOfDay : times.length
			) : 1;
		}
		// Get the limits - for the curious
		function getLimits() {
			return limits;
		}

		// Current time
		var current = null;
		var Time = function(day, time) {
			this.day = day;
			this.time = time;
		};
		// Get the time
		function getCurrent() {
			return current;
		}
		// Convert to timestamp
		function getTimestamp(time) {
			if (!time)
				time = current;

			return time.day + "." + time.time;
		}
		// Unmarshal a timestamp
		function fromTimestamp(timestamp) {
			var parts = timestamp.split(".");
			return new Time(parts[0], parts[1]);
		}

		// Start timer at (1, 1)
		function start() {
			current = new Time(1, 1);
			return true;
		}

		// Move to the next timeslot
		function next() {
			if (isLast())
				return false;

			var nextDay = isEOD() ? (current.day + 1) : current.day;
			var nextTime = isEOD() ? 1 : (current.time + 1);

			current = new Time(nextDay, nextTime);
			return true;
		}

		function isEOD() {
			return current.time === limits.times;
		}

		function _isLastDay() {
			return current.day === limits.days;
		}

		function isLast() {
			return _isLastDay() && isEOD();
		}

		return {
			config: setLimits
			, getLimits: getLimits
			, start: start
			, next: next
			, isLast: isLast
			, isEOD: isEOD
			, now: getCurrent
			, toTimestamp: getTimestamp
			, fromTimestamp: fromTimestamp
			, toTimeOfDay: toTimeOfDay
		};
	});

'use strict';

angular.module('travelPlanningGame.app')
	.directive('landmarkCard', function() {
		return {
			restrict: 'EA'
			, transclude: true
			, scope: {
				landmark: '='
			}
			, templateUrl: 'templates/landmark-card.tpl.html'
		};
	});

'use strict';

angular.module('travelPlanningGame.maps')
	.directive('gameMap', function() {
		return {
			templateUrl: 'templates/maps.game.tpl.html'
			, restrict: 'EA'
			, scope: {
				config: "&options"
				, current: "="
				, selected: "="
			}
			, controller: function($scope, $q, angulargmContainer, angulargmUtils, mapStyles, mapRouter,
				mapGeocoder, stateTracker) {

				// On load, see if the map data is ready
				$scope.mapState = stateTracker.get("mapState");
				$scope.mapState.$on("updated", function() {
					$scope.mapState.load();
					loadMap();
					$scope.mapState.ready();
				});

				// As soon as Google maps is ready, grab a handle
				angulargmContainer.getMapPromise('gameMap').then(function(gmap) {
					$scope.map = gmap;
				});

				function loadMap() {
					// Request Google map to kindly use our preset parameters
					initMap();

					// Get geo coords for all available locations
					angular.forEach($scope.locations, function(location, index) {
						// Give it an id
						location.id = index;

						plotLocation(location).then(function() {
							$scope.focus();

							// Update the markers being displayed on the map
							$scope.$broadcast('gmMarkersUpdate');

							// If last, mark geocoding as complete
							if (index === $scope.locations.length - 1)
								stateTracker.new("geocodingState").complete();
						});
					});

					// When geocoding is complete, prefetch all routes
					stateTracker.new("geocodingState").$on("complete", function() {
						mapRouter.prefetch($scope.locations);
					});
				}

				// When the map is ready, apply the params and updates
				function initMap() {
					// Initialise all map parameters
					angular.extend($scope, $scope.config());

					$scope.disabled = $scope.disabled || angular.isUndefined(google);
					$scope.type = 'roadmap';
					$scope.bounds = new google.maps.LatLngBounds();
					$scope.styles = mapStyles.routeXL;

					// Request Google map to kindly use our preset parameters
					$scope.map.mapTypeId = $scope.type;
					$scope.map.zoom = $scope.zoom;
					$scope.map.setOptions({
						styles: $scope.styles
						, panControl: false
						, scaleControl: false
						, mapTypeControl: false
						, streetViewControl: false
						, overviewMapControl: false
						, zoomControlOptions: {
							style: google.maps.ZoomControlStyle.SMALL
							, position: google.maps.ControlPosition.RIGHT_CENTER
						}
					});

					// Show transit layer
					if ($scope.showTransit) {
						var transitLayer = new google.maps.TransitLayer();
						transitLayer.setMap($scope.map);
					}
				}

				// Plot location markers on the map
				function plotLocation(location) {
					var deferred = $q.defer();

					mapGeocoder.toCoords(location.address)
						.then(
							function success(coords) {
								// Add the coords into the location
								location.coords = angular.copy(coords);
								$scope.bounds.extend(angulargmUtils.objToLatLng(coords));

								// Show landmark label
								$scope.showLabel(location, null, $scope.map);

								deferred.resolve();
							}
							, function error() {
								deferred.resolve();
							}
						);

					return deferred.promise;
				}

				// Focus on the focusable location - either selected or current
				// based on the initial config
				$scope.focus = function() {
					var focalPoint = null;

					if ($scope.focusOn === "selected" || ($scope.focusOn === "auto" && $scope.selected))
						focalPoint = $scope.selected;
					else if ($scope.focusOn === "current" || ($scope.focusOn === "auto" && !$scope.selected))
						focalPoint = $scope.current;

					if (focalPoint && focalPoint.coords) {
						$scope.map.panTo(angulargmUtils.objToLatLng({
							lat: focalPoint.coords.lat
							, lng: focalPoint.coords.lng - 0.02
						}));
					} else {
						// Auto center and zoom the map
						$scope.map.fitBounds($scope.bounds);
					}
				};

				// Select a point on the map (other than a marker/location)
				$scope.selectPoint = function(map, event) {
					if ($scope.selectable !== "point" && $scope.selectable !== "all") return;

					var point = {
						id: 'startingPoint'
						, name: 'I start from here!'
						, coords: angulargmUtils.latLngToObj(event.latLng)
					};

					// Create a single-member collection of points for this selected starting point
					$scope.points = [point];

					// Mark as selected
					$scope.selected = point;
					$scope.focus(); // focus if needed

					// Show label
					$scope.showLabel(point, null, $scope.map);

					// // Update the markers being displayed on the map
					$scope.$broadcast('gmMarkersUpdate');
				};

				// Change location as needed
				$scope.selectLocation = function(location, marker) {
					if ($scope.selectable !== "location" && $scope.selectable !== "all") return;

					// Update the location
					$scope.selected = location;
					$scope.focus(); // focus if needed

					// Draw route
					if($scope.current) {
						mapRouter.fetch($scope.current, $scope.selected).then(function(route) {
							mapRouter.draw(route, $scope.map);
						});
					}

					// Show label
					$scope.showLabel(location, null, $scope.map);

					// Update the markers being displayed on the map
					$scope.$broadcast('gmMarkersUpdate');
				};

				// Construct an info window for the landmark label
				$scope.infoWindows = {}; // track all info windows
				$scope.showLabel = function(location, marker, map) {
					// Either of map and marker must be provided
					if (!marker && !map) {
						return false;
					}

					// Does an infowindow already exist for this location?
					var infoWindow;
					if ($scope.infoWindows[location.id]) {
						// Yes, destroy it
						$scope.infoWindows[location.id].close();
					}

					// Now, create one
					var options = {};
					options.content = '<span style="font-weight: 700">' + location.name + '</span>';
					options.position = angulargmUtils.objToLatLng(location.coords);
					options.pixelOffset = new google.maps.Size(0, -15);

					infoWindow = new google.maps.InfoWindow(options);
					$scope.infoWindows[location.id] = infoWindow;

					if (!map) {
						map = marker.getMap();
					}
					infoWindow.open(map);
					return true;
				};

				// Marker appearance
				$scope.getMarkerOptions = function(location) {

					// Standard marker
					var defaultMarker = {
						url: '../images/markers/marker-grey.png'
						, size: new google.maps.Size(30, 30)
						, origin: new google.maps.Point(0, 0)
						, anchor: new google.maps.Point(15, 15)
					};

					// Selected location marker
					var selectedMarker = {
						url: '../images/markers/marker-orange.png'
						, size: new google.maps.Size(66, 66)
						, origin: new google.maps.Point(0, 0)
						, anchor: new google.maps.Point(33, 33)
					};

					// Current location marker
					var currentMarker = {
						url: '../images/markers/marker-green.png'
						, size: new google.maps.Size(104, 104)
						, origin: new google.maps.Point(0, 0)
						, anchor: new google.maps.Point(52, 52)
					};

					// Pick a marker based on the location
					var icon = null;
					if ($scope.current && $scope.current.id === location.id)
						icon = currentMarker;
					else if ($scope.selected && $scope.selected.id === location.id)
						icon = selectedMarker;
					else
						icon = defaultMarker;

					var options = {
						title: "Click to select " + location.name
						, icon: icon
					};

					return options;
				};


			}
		};
	});

'use strict';

angular.module('travelPlanningGame.widgets')
	.directive('widgetResourceIndicator', function() {
		return {
			restrict: 'EA'
			, templateUrl: 'templates/widgets.resource-indicator.tpl.html'
			, scope: {
				resources: '='
				, type: '@'
				, category: "@"
			}
			, link: function(scope, elem, attrs) {
				scope.icon = scope.type === 'MONEY' ? 'dollar' : (scope.type === 'XP' ? 'star' :
					'shopping-cart');
			}
			, controller: function($scope, $filter, resources) {
				$scope.getValue = function() {
					return $filter("number")($scope.resources.get(resources.categories[$scope.category],
						resources.types[$scope.type]));
				};
			}
		};
	})
	.directive('widgetDayCounter', function() {
		return {
			restrict: 'EA'
			, templateUrl: 'templates/widgets.day-counter.tpl.html'
			, scope: {
				day: "="
			}
			, controller: function($scope, timer) {

				$scope.$watch("day", function(newValue) {
					$scope.now = timer.now();
					$scope.limits = timer.getLimits();
				});
			}
		};
	})
	.directive('widgetAlert', function() {
		return {
			restrict: 'EA'
			, templateUrl: 'templates/widgets.alert.tpl.html'
			, scope: {
				content: "=widgetAlert"
				, chevron: "@"
			}
			, controller: function($scope) {
			}
		};
	});

angular.module("travelPlanningGame.app")
	.controller("BootCtrl", function($scope) {
		$scope.isReady = function() {
			return angular.isDefined(google);
		};
	});

angular.module("travelPlanningGame.app")
	.controller('GameCtrl', function($scope, $timeout, $q, timer, landmarks, resources, history,
		stateTracker, mapRouter) {

		/////////////////////////
		// Current game state //
		/////////////////////////
		$scope.current = {};

		//////////////////
		// Game states //
		//////////////////

		// Current status
		$scope.current.state = stateTracker.new([{
			state: "menu"
			, set: "menu"
			, check: "isMenu"
		}, {
			state: "playing"
			, set: "play"
			, check: "isPlaying"
		}, {
			state: "stats"
			, set: "stats"
			, check: "isStats"
		}], "gameState");

		///////////////////////////
		// Game master controls //
		///////////////////////////
		$scope.game = {};
		$scope.game.start = function() {
			// Start the game
			$scope.current.state.play();

			// Create a resource tracker
			var resourceTracker = resources.new();
			resourceTracker.set(resources.categories.ALL, resources.types.MONEY, $scope.settings.budget);
			$scope.resources = resourceTracker;

			// Start the timer
			timer.config($scope.settings.travelDays, 3);
			timer.start();

			// Initial activities before the player can play turns
			initPlay();
		};
		$scope.game.end = function() {
			// End the game
			$scope.current.state.stats();
		};
		$scope.game.menu = function() {
			// Back to the menu
			$scope.current.state.menu();
		};

		$scope.getDay = function() {
			return timer.now().day;
		};

		/////////////////
		// Game turns //
		/////////////////

		$scope.turnState = stateTracker.new("turnState");

		function initPlay() {
			$scope.alertMessage =
				"<h2>Where will you be starting?</h2><p>Select your hotel location on the map.</p>";
			$timeout(function() {
				stateTracker.get("alert").show();
			}, 500);
		}

		// Set the selected location/point as the current start point
		$scope.game.setStartPoint = function() {
			$scope.current.location = $scope.locations.selected;
			$scope.locations.selected = null;
			$scope.map.options.selectable = "location";

			stateTracker.get("alert").dismiss();

			$scope.map.state.update();
		};

		// Check conditions for eligibility for another round
		$scope.game.canPlay = function(giveReason) {
			var deferred = $q.defer();

			// Landmark selected?
			if (!$scope.locations.selected)
				return giveReason ? 'Select a landmark to visit.' : false;

			// Everything is permitted in sandbox mode (once a landmark is selected)
			if ($scope.settings.sandboxMode)
				return giveReason ? null : true;

			// Funds left for visiting/travelling/lodging?
			var expectedCosts = resources.copy($scope.locations.selected.resources);
			// Add travel costs
			var travelCost = 0;
			if($scope.current.location) {
				var travelRoute = mapRouter.get($scope.current.location, $scope.locations.selected);
				if(travelRoute)
					travelCost = travelRoute.cost;
			}

			expectedCosts.set(resources.categories.VISITING, resources.types.MONEY,
				expectedCosts.get(resources.categories.VISITING, resources.types.MONEY) - travelCost
			);

			if (!resources.canDelta($scope.resources, resources.categories.ALL, $scope.locations.selected.resources,
				resources.categories.VISITING))
				return giveReason ? 'Not enough funds to visit.' : false;

			// If EOD, funds left for lodging?
			if (timer.isEOD() && !resources.canDelta($scope.resources, resources.categories.ALL, $scope.locations
				.selected.resources,
				resources.categories.LODGING))
				return giveReason ? 'Not enough funds to stay.' : false;

			return giveReason ? null : true;
		};

		// Start this turn
		$scope.game.startTurn = function() {
			// Set the selected landmark as the current location
			$scope.current.location = $scope.locations.selected;
			// Restrict further selection to landmarks only
			$scope.map.options.selectable = "location";
			$scope.map.state.update();

			// Charge for visiting costs and experience
			resources.delta($scope.resources, resources.categories.ALL, $scope.current.location.resources,
				resources.categories.VISITING);

			// One-time xp points for "discovery"
			if (!history.getInstance("landmarks").find($scope.current.location))
				resources.delta($scope.resources, resources.categories.ALL, $scope.current.location.resources,
					resources.categories.DISCOVERY);

			$scope.turnState.activate();
		};

		$scope.game.canShop = function(giveReason) {
			// Funds left?
			if (!resources.canDelta($scope.resources, resources.categories.ALL, $scope.current.location.resources,
				resources.categories.SHOPPING))
				return giveReason ? 'Not enough funds for shopping today.' : false;

			return giveReason ? null : true;
		};

		$scope.game.shop = function() {
			// Charge for shopping
			resources.delta($scope.resources, resources.categories.ALL, $scope.current.location.resources,
				resources.categories.SHOPPING);
		};

		$scope.game.endTurn = function() {
			$scope.turnState.complete();

			// Is this EOD? Charge for lodging
			if (timer.isEOD())
				resources.delta($scope.resources, resources.categories.ALL, $scope.current.location.resources,
					resources.categories.LODGING);

			// Days left?
			if (timer.isLast())
				$scope.game.end(); // end game

			// Record today's state in history
			history.getInstance("resources").record(timer.toTimestamp(), resources);
			history.getInstance("landmarks").record(timer.toTimestamp(), $scope.current.location);

			// Next turn this day
			timer.next();

			// Un-set as current location [FIXME]
			$scope.locations.selected = null;
		};

		// Generic function to execute a "canI ?" function to supply a reason instead of just true/false
		$scope.whyCantI = function(task) {
			return task(true);
		};

		///////////////
		// Locations //
		///////////////
		$scope.locations = {};
		$scope.locations.cities = ["Singapore"]; // cities
		landmarks.getCities().then(function(data) {
			$scope.locations.cities = data;
		});
		$scope.locations.landmarks = null; // landmarks
		landmarks.get().then(function(data) {
			$scope.locations.landmarks = data;

			// Supply to the map
			$scope.map.options.locations = $scope.locations.landmarks;
			// Notify update
			$scope.map.state.update();
		});
		$scope.locations.selected = null; // selected landmark for whatever reason

		// Current status
		$scope.current.location = null;
		$scope.current.city = $scope.locations.cities[0];

		/////////////////////
		// Game settings //
		/////////////////////
		$scope.settings = {};
		$scope.settings.budget = 1000;
		$scope.settings.travelDays = 4;

		///////////////////////
		// Game board/map  //
		///////////////////////

		$scope.map = {};

		$scope.map.state = stateTracker.new([{
			state: "unavailable"
			, set: "destroy"
			, check: "isUnavailable"
		}, {
			state: "updated"
			, set: "update"
			, check: "isUpdated"
		}, {
			state: "loading"
			, set: "load"
			, check: "isLoading"
		}, {
			state: "ready"
			, set: "ready"
			, check: "isReady"
		}], "mapState");

		$scope.map.options = {
			zoom: 12
			, locations: null
			, selectable: "all" // all, point, location, none
			, focusOn: "auto" // auto, selected, current, none
			, disabled: false
			, showTransit: false
		};

		// Test function
		$scope.test = function() {
			$scope.locations.selected = null;
			$scope.map.options.selectable = "location";
			$scope.map.state.update();
		};
	});

angular.module('travelPlanningGame.templates', ['templates/landmark-card.tpl.html', 'templates/maps.game.tpl.html', 'templates/widgets.alert.tpl.html', 'templates/widgets.day-counter.tpl.html', 'templates/widgets.resource-indicator.tpl.html']);

angular.module('templates/landmark-card.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/landmark-card.tpl.html',
    '<!-- Landmark card -->\n' +
    '<div class="landmark-card panel panel-primary">\n' +
    '\n' +
    '	<!-- Landmark name and controls -->\n' +
    '	<div class="panel-header panel-heading">\n' +
    '\n' +
    '		<!-- Controls -->\n' +
    '		<i class="fa close fa-times fa-fw"\n' +
    '			state-tracker="landmarkCardState"\n' +
    '			ng-click="landmarkCardState.complete()"></i>\n' +
    '		<!-- <i class="fa close fa-rotate-left fa-fw" ng-click="isFlipped = !isFlipped"></i> -->\n' +
    '\n' +
    '		<h3>{{ landmark.name }}</h3>\n' +
    '	</div>\n' +
    '	<!-- end name and controls -->\n' +
    '\n' +
    '	<!-- Image and quick stats -->\n' +
    '	<div class="panel-body" ng-style="{\'background-image\': \'url(\' + landmark.image + \')\'}">\n' +
    '		<div class="col-xs-offset-9">\n' +
    '			<div class="thumbnail resource text-center">\n' +
    '				<small>LODGING</small>\n' +
    '				<h3>{{ landmark.lodgingCost }} <i class="fa fa-dollar"></i>\n' +
    '				</h3>\n' +
    '				<small>PER DAY</small>\n' +
    '			</div>\n' +
    '			<div class="thumbnail resource text-center">\n' +
    '				<small>VISITING</small>\n' +
    '				<h3>{{ landmark.visitingCost }} <i class="fa fa-dollar"></i>\n' +
    '				</h3>\n' +
    '				+{{ landmark.visitingExp }} <i class="fa fa-star"></i>\n' +
    '			</div>\n' +
    '			<div class="thumbnail resource text-center">\n' +
    '				<img ng-src="{{ landmark.shopping.image }}" />\n' +
    '			</div>\n' +
    '		</div>\n' +
    '	</div>\n' +
    '	<!-- end image and stats -->\n' +
    '\n' +
    '	<!-- Features, flavour text and options -->\n' +
    '	<ul class="list-group">\n' +
    '		<li class="list-group-item list-item" ng-repeat="bonus in landmark.bonuses">\n' +
    '			<span class="pull-right text-primary" ng-show="bonus.type">{{ bonus.type | uppercase }}</span>\n' +
    '			<i class="fa" ng-class="bonus.icon"></i> {{ bonus.flavour }}\n' +
    '			<em class="text-muted" ng-show="bonus.implication">\n' +
    '				<small>({{ bonus.implication }})</small>\n' +
    '			</em>\n' +
    '		</li>\n' +
    '	</ul>\n' +
    '	<!-- end features -->\n' +
    '\n' +
    '	<!-- One time bonus -->\n' +
    '	<div class="panel-footer text-center">\n' +
    '		One-time visiting bonus:\n' +
    '		<strong>+{{ landmark.exp }} <i class="fa fa-star"></i>\n' +
    '		</strong>\n' +
    '	</div>\n' +
    '	<!-- end bonus -->\n' +
    '\n' +
    '</div>\n' +
    '<!-- end card -->\n' +
    '');
}]);

angular.module('templates/maps.game.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/maps.game.tpl.html',
    '<div gm-map\n' +
    '	ng-if="!disabled"\n' +
    '	class="map-canvas"\n' +
    '	gm-map-id="\'gameMap\'"\n' +
    '	gm-center="center"\n' +
    '	gm-zoom="zoom"\n' +
    '	gm-bounds="bounds"\n' +
    '	gm-map-type-id="type"\n' +
    '	gm-on-click="selectPoint(map, event)">\n' +
    '	<div gm-markers\n' +
    '		gm-objects="locations"\n' +
    '		gm-id="object.id"\n' +
    '		gm-marker-options="getMarkerOptions(object)"\n' +
    '		gm-position="{lat: object.coords.lat, lng: object.coords.lng}"\n' +
    '		gm-on-click="selectLocation(object, marker)">\n' +
    '	</div>\n' +
    '	<div gm-markers\n' +
    '		gm-objects="points"\n' +
    '		gm-id="object.id"\n' +
    '		gm-marker-options="getMarkerOptions(object)"\n' +
    '		gm-position="{lat: object.coords.lat, lng: object.coords.lng}"\n' +
    '		gm-on-click="selectPoint(map, event)">\n' +
    '	</div>\n' +
    '	<div id="map-infoWindow-markerLabel-sample">\n' +
    '		<div class="well">\n' +
    '			<strong>{{ location.name }}</strong>\n' +
    '		</div>\n' +
    '	</div>\n' +
    '</div>\n' +
    '');
}]);

angular.module('templates/widgets.alert.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/widgets.alert.tpl.html',
    '<div class="widget-alert" ng-bind-html="content"></div>\n' +
    '<div class="chevron" ng-class="chevron" ng-if="chevron"></div>');
}]);

angular.module('templates/widgets.day-counter.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/widgets.day-counter.tpl.html',
    '<div class="widget-day-counter">\n' +
    '	<h1>Day</h1>\n' +
    '	<h1>{{ now.day | number }}<small>/ {{ limits.days }}</h1>\n' +
    '</div>\n' +
    '');
}]);

angular.module('templates/widgets.resource-indicator.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/widgets.resource-indicator.tpl.html',
    '<div class="widget-resource-indicator" ng-class="\'widget-resource-indicator-\' + type">\n' +
    '	<i class="widget-resource-indicator-icon fa fa-fw fa-3x" ng-class="\'fa-\' + icon"></i>\n' +
    '	<span class="widget-resource-indicator-value" ng-bind="getValue()"></span>\n' +
    '</div>\n' +
    '');
}]);
