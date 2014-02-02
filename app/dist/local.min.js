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
	.run(function(locations, randomEvents) {
		locations.getLandmarks();
		locations.getCities();
		randomEvents.load();
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
	.factory("locations", function($http, $q, resources) {

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

		return {
			getLandmarks: loadLandmarks
			, getCities: loadCities
		};
	});

'use strict';

angular.module('travelPlanningGame.maps')
	.factory('mapGeocoder', function($q, angulargmUtils) {
		if(typeof google === "undefined") return;

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
					deferred.resolve(rome2rio.getCost(routes));
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
		var routingHistory = history.getInstance("mapRouter", angular.identity, angular.identity);

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
		mapStyles["Kevin's Styles"] = [
  {
    "featureType": "water",
    "stylers": [
      { "hue": "#0088ff" },
      { "lightness": -38 },
      { "saturation": -41 }
    ]
  },{
    "featureType": "road.local",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.arterial",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "simplified" },
      { "saturation": -100 },
      { "weight": 0.7 }
    ]
  },{
    "featureType": "administrative.neighborhood",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.government",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.medical",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "on" },
      { "hue": "#00ff22" },
      { "saturation": 1 },
      { "lightness": -39 }
    ]
  },{
    "featureType": "poi.school",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.sports_complex",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.attraction",
    "elementType": "labels.text.stroke",
    "stylers": [
      { "saturation": 100 },
      { "hue": "#ff3c00" },
      { "weight": 6 },
      { "lightness": -47 }
    ]
  },{
    "featureType": "poi.attraction",
    "elementType": "labels.text.fill",
    "stylers": [
      { "lightness": 100 }
    ]
  },{
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      { "color": "#808080" },
      { "hue": "#00ff11" },
      { "weight": 4 },
      { "saturation": 48 },
      { "lightness": -25 }
    ]
  },{
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      { "lightness": 100 }
    ]
  },{
    "featureType": "administrative.country",
    "elementType": "geometry",
    "stylers": [
      { "hue": "#0088ff" },
      { "saturation": 78 },
      { "lightness": 65 },
      { "weight": 4 }
    ]
  },{
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      { "visibility": "on" },
      { "lightness": 100 }
    ]
  },{
    "featureType": "administrative.country",
    "elementType": "labels.text.stroke",
    "stylers": [
      { "weight": 0.1 }
    ]
  },{
    "featureType": "administrative.locality",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "landscape.natural",
    "elementType": "labels.text.fill",
    "stylers": [
      { "lightness": 100 }
    ]
  },{
    "featureType": "poi.business",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      { "saturation": 100 },
      { "lightness": -7 },
      { "hue": "#ffc300" }
    ]
  },{
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      { "saturation": 100 },
      { "hue": "#ffa200" },
      { "weight": 3.2 },
      { "lightness": -13 }
    ]
  },{
    "featureType": "transit.line",
    "elementType": "labels",
    "stylers": [
      { "hue": "#ff7700" },
      { "lightness": 10 }
    ]
  },{
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      { "lightness": 100 }
    ]
  },{
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [
      { "hue": "#005eff" },
      { "weight": 8 },
      { "saturation": 55 }
    ]
  },{
    "featureType": "landscape",
    "elementType": "labels.text.stroke",
    "stylers": [
      { "saturation": 100 },
      { "hue": "#ffc300" },
      { "weight": 5 },
      { "lightness": -64 }
    ]
  },{
  }
];
		mapStyles.shiftWorker = [{"stylers":[{"saturation":-100},{"gamma":1}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"on"},{"saturation":50},{"gamma":0},{"hue":"#50a5d1"}]},{"featureType":"administrative.neighborhood","elementType":"labels.text.fill","stylers":[{"color":"#333333"}]},{"featureType":"road.local","elementType":"labels.text","stylers":[{"weight":0.5},{"color":"#333333"}]},{"featureType":"transit.station","elementType":"labels.icon","stylers":[{"gamma":1},{"saturation":50}]}];
		mapStyles.routeXL = [{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"on"},{"saturation":-100},{"lightness":20}]},{"featureType":"road","elementType":"all","stylers":[{"visibility":"on"},{"saturation":-100},{"lightness":40}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"on"},{"saturation":-10},{"lightness":30}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"simplified"},{"saturation":-60},{"lightness":10}]},{"featureType":"landscape.natural","elementType":"all","stylers":[{"visibility":"simplified"},{"saturation":-60},{"lightness":60}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"},{"saturation":-100},{"lightness":60}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"},{"saturation":-100},{"lightness":60}]}];
		mapStyles.paleDawn = [{"featureType":"water","stylers":[{"visibility":"on"},{"color":"#acbcc9"}]},{"featureType":"landscape","stylers":[{"color":"#f2e5d4"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#c5c6c6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#e4d7c6"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#fbfaf7"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#c5dac6"}]},{"featureType":"administrative","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"road"},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{},{"featureType":"road","stylers":[{"lightness":20}]}];
		mapStyles.oldTimey = [{"featureType":"administrative","stylers":[{"visibility":"off"}]},{"featureType":"poi","stylers":[{"visibility":"simplified"}]},{"featureType":"road","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"simplified"}]},{"featureType":"transit","stylers":[{"visibility":"simplified"}]},{"featureType":"landscape","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"visibility":"off"}]},{"featureType":"road.local","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"color":"#84afa3"},{"lightness":52}]},{"stylers":[{"saturation":-77}]},{"featureType":"road"}];
		mapStyles.midnight = [{"featureType":"water","stylers":[{"color":"#021019"}]},{"featureType":"landscape","stylers":[{"color":"#08304b"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#000000"},{"lightness":13}]},{"featureType":"transit","stylers":[{"color":"#146474"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]}];
		mapStyles.retro = [{"featureType":"administrative","stylers":[{"visibility":"off"}]},{"featureType":"poi","stylers":[{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"simplified"}]},{"featureType":"transit","stylers":[{"visibility":"simplified"}]},{"featureType":"landscape","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"visibility":"off"}]},{"featureType":"road.local","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"color":"#84afa3"},{"lightness":52}]},{"stylers":[{"saturation":-17},{"gamma":0.36}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#3f518c"}]}];
		mapStyles.gowalla = [{"featureType":"road","elementType":"labels","stylers":[{"visibility":"simplified"},{"lightness":20}]},{"featureType":"administrative.land_parcel","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"hue":"#a1cdfc"},{"saturation":30},{"lightness":49}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"hue":"#f49935"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"hue":"#fad959"}]}];
		mapStyles.greyscale = [{"featureType":"all","stylers":[{"saturation":-100},{"gamma":0.5}]}];
		mapStyles.subtle = [{"featureType":"poi","stylers":[{"visibility":"off"}]},{"stylers":[{"saturation":-70},{"lightness":37},{"gamma":1.15}]},{"elementType":"labels","stylers":[{"gamma":0.26},{"visibility":"off"}]},{"featureType":"road","stylers":[{"lightness":0},{"saturation":0},{"hue":"#ffffff"},{"gamma":0}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"lightness":50},{"saturation":0},{"hue":"#ffffff"}]},{"featureType":"administrative.province","stylers":[{"visibility":"on"},{"lightness":-50}]},{"featureType":"administrative.province","elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"administrative.province","elementType":"labels.text","stylers":[{"lightness":20}]}];
		mapStyles.paper = [{"featureType":"administrative","stylers":[{"visibility":"off"}]},{"featureType":"poi","stylers":[{"visibility":"simplified"}]},{"featureType":"road","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"simplified"}]},{"featureType":"transit","stylers":[{"visibility":"simplified"}]},{"featureType":"landscape","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"visibility":"off"}]},{"featureType":"road.local","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"road.arterial","stylers":[{"visibility":"off"}]},{"featureType":"water","stylers":[{"color":"#5f94ff"},{"lightness":26},{"gamma":5.86}]},{},{"featureType":"road.highway","stylers":[{"weight":0.6},{"saturation":-85},{"lightness":61}]},{"featureType":"road"},{},{"featureType":"landscape","stylers":[{"hue":"#0066ff"},{"saturation":74},{"lightness":100}]}];


		return mapStyles;
	});

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

angular.module("travelPlanningGame.app")
	.factory("resources", function() {

		// Resource types
		var types = {};
		types.ALL = "type_all";
		types.MONEY = "type_money";
		types.XP = "type_xp";
		types.SOUVENIR = "type_souvenir";

		// Categories of events representing possible resource applications
		var categories = {};
		categories.ALL = "cat_all"; // special case: equivalent to each of the other categories
		categories.VISITING = "cat_visiting"; // example, visiting cost
		categories.TRANSPORT = "cat_transport";
		categories.LODGING = "cat_lodging";
		categories.SHOPPING = "cat_shopping"; // example, shopping gains
		categories.DISCOVERY = "cat_discovery"; // i.e. one-time events
		// add other categories dynamically as needed

		// Operations possible for filters to be applied on resources
		var operations = {};
		operations.ADD = "op_add";
		operations.MULTIPLY = "op_multiply";

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

			// Initialize a track for a particular category and type
			this._init = function initTrack(category, type) {
				// Create if no prevalent track
				if (!this[category])
					this[category] = {};
				if (!this[category][type])
					this[category][type] = 0;
			};

			// Set the value of a resource
			// Overwrites any existing value, and doesn't perform validation tests
			this.set = function setResource(category, type, amount) {
				this._init(category, type);
				this[category][type] = amount;

				return this;
			};

			// Ability to update the value of any resource
			// Checks for validation unless specified to skip
			this.update = function updateResource(category, type, amount, skipTests) {
				this._init(category, type);

				if(skipTests || (this[category][type] + amount > 0))
					this[category][type] += amount;

				return this;
			};

			// Convenience functions for adding and subtracting amounts
			this.add = this.update;
			this.subtract = function subtractResource(category, type, amount, skipTests) {
				return this.update(category, type, -1 * amount, skipTests);
			};

			// Add filters
			this._filters = [];
			this.addFilter = function addFilter(category, type, amount, operation, times) {
				var newFilter = new Filter(category, type, amount, operation, times);
				this._filters.push(newFilter);
			};

			this.filter = function applyFilters(category, type, amount, isTest){
				for(var i = 0, len = this._filters.length; i < len; i++)
					amount = this._filters[i].apply(category, type, amount, isTest);

				return amount;
			};
		};

		// Filters - attached to each resource
		// Use to filter updates to a resource (example 50% discount)
		var Filter = function(filterCategory, filterType, filterAmount, filterOperation, filterTimes) {
			this.category = filterCategory;
			this.type = filterType;
			this.modifier = filterAmount;
			this.operation = filterOperation;
			this.times = filterTimes;

			this.apply = function applyFilter(category, type, amount, isTest) {
				if(this.times !== 0) {
					if(this.category === category && this.type === type) {
						amount = this.modify(amount);
						if(!isTest)
							this.times--;
					}
				}

				return amount;
			};

			this.modify = function performOperation(amount) {
				if(this.operation === operations.ADD)
					return parseInt(amount + this.modifier, 10);
				else if(this.operation === operations.MULTIPLY)
					return parseInt(amount * this.modifier, 10);
				else
					return amount;
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

		// Check whether updating the target resource by the source resource is possible
		// on supplied categories (if any)
		function canAddResource(targetResource, sourceResource, categoriesToConsider) {

			// Final answer
			var possible = true;

			// Can we legally add the resource?
			if (sourceResource) {

				// Yes. Do we have a limitation on categories to consider?
				if(!categoriesToConsider)
					categoriesToConsider = categories; // No, consider all categories

				// Check if we can add resources from each category
				angular.forEach(categoriesToConsider, function(category, index) {
					angular.forEach(sourceResource[category], function(amount, type) {

						// Apply any filters to the amount
						amount = targetResource.filter(category, type, amount, true);

						// Does the target resource have an ALL category?
						if(targetResource[categories.ALL])
							possible = possible && (targetResource.get(categories.ALL, type) + amount > 0); // yes, can we update that as a catch-all?
						else
							possible = possible && (targetResource.get(category, type) + amount > 0); // no, can we update the corresponding category?
					});
				});
			}

			return possible;
		}

		// Update target resources by source resources on supplied categories (if any)
		function addResource(targetResource, sourceResource, categoriesToConsider) {

			// Can we legally add the resource?
			if (sourceResource && canAddResource(targetResource, sourceResource, categoriesToConsider)) {

				// Yes. Do we have a limitation on categories to consider?
				if(!categoriesToConsider)
					categoriesToConsider = categories; // No, consider all categories

				// Add resources from each category
				angular.forEach(categoriesToConsider, function(category, index) {
					angular.forEach(sourceResource[category], function(amount, type) {

						// Apply any filters to the amount
						amount = targetResource.filter(category, type, amount);

						// Does the target resource have an ALL category?
						if(targetResource[categories.ALL])
							targetResource.update(categories.ALL, type, amount); // yes, update that as a catch-all
						else
							targetResource.update(category, type, amount); // no, update the corresponding category
					});
				});
			}

			return targetResource;
		}

		return {
			new: startTracker
			, copy: duplicateTracker
			, canMerge: canAddResource
			, merge: addResource
			, types: types
			, categories: categories
			, operations: operations
		};
	});

angular.module("travelPlanningGame.app")
	.factory("timer", function() {

		// Times of a day
		var times = ["morning", "afternoon", "evening", "night"];
		// Utility to get the display name by number
		function toTimeOfDay(time) {
			return times[time - 1] ? times[time - 1] : null;
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

angular.module('travelPlanningGame.app')
	.directive('loading', function() {
		return {
			restrict: 'EA'
			, templateUrl: 'templates/loading.tpl.html'
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
				mapGeocoder, stateTracker, resources) {

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
					$scope.clearLabels();

					// Request Google map to kindly use our preset parameters
					setMapParameters();

					// Get geo coords for all available locations
					angular.forEach($scope.locations, function(location, index) {
						// Give it an id
						location.id = index;

						plotLocation(location).then(function() {
							$scope.focus();

							// Refresh the markers being displayed on the map
							$scope.$broadcast('gmMarkersRedraw');

							// If last, mark geocoding as complete
							if (index === $scope.locations.length - 1)
								stateTracker.new("geocodingState").complete();
						});
					});

					// When geocoding is complete, prefetch all routes
					stateTracker.new("geocodingState").$on("complete", function() {
						stateTracker.new("geocodingState").reset();
						mapRouter.prefetch($scope.locations);
					});
				}

				// When the map is ready, apply the params and updates
				function setMapParameters() {
					// Initialise all map parameters
					angular.extend($scope, $scope.config());

					$scope.disabled = $scope.disabled || angular.isUndefined(google);
					$scope.type = 'roadmap';
					$scope.bounds = new google.maps.LatLngBounds();
					$scope.styles = window.selectedMapStyles;

					$scope.$on("event:map:stylesChanged", function() {
						$scope.map.setOptions({
							styles: window.selectedMapStyles
						});
					});

					// Request Google map to kindly use our preset parameters
					$scope.map.setOptions({
						styles: $scope.styles
						, mapTypeId: $scope.type
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

					// If zoom is not set to auto
					if($scope.zoom !== "auto")
						$scope.map.setZoom($scope.zoom); // the only way the map respects us
				};

				// Select a point on the map (other than a marker/location)
				$scope.selectPoint = function(map, event) {
					if ($scope.selectable !== "point" && $scope.selectable !== "all") return;

					var point = {
						id: 'startingPoint'
						, name: 'I start from here!'
						, coords: event.latLng ? angulargmUtils.latLngToObj(event.latLng) : event.coords
						, description: 'This is where you started your journey from. This could be your starting hotel. Return here whenever you wish to.'
						// , image: "images/landmarks/casino_sentosa.jpg"
						, lodgingCost: 0
						, visitingCost: 0
						, visitingExp: 0
						, shopping: {
							name: ''
							, description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.'
							// , image: images/items/anz_icon_singapore_sling.png
							, souvenirs: 0
							, cost: 0
						}
						, exp: 0
					};
					point.resources = resources.new();
					// Typical landmark resources: visitingCost, lodgingCost, visitingExp, souvenirs, souvenirCost, exp
					point.resources.set(resources.categories.VISITING, resources.types.MONEY, 0);
					point.resources.set(resources.categories.LODGING, resources.types.MONEY, 0);
					point.resources.set(resources.categories.VISITING, resources.types.XP, 0);
					point.resources.set(resources.categories.SHOPPING, resources.types.SOUVENIR, 0);
					point.resources.set(resources.categories.SHOPPING, resources.types.MONEY, 0);
					point.resources.set(resources.categories.DISCOVERY, resources.types.XP, 0);

					// Create a single-member collection of points for this selected starting point
					$scope.points = [point];

					// Mark as selected
					$scope.selected = point;
					$scope.focus(); // focus if needed

					// Show label
					$scope.showLabel(point, null, $scope.map);

					// Update the markers being displayed on the map
					// Note: because this is a new point selected on the map
					// that erases any previously-selected point, we need
					// to force redraw instead of just a notify update (which does a shallow object match)
					$scope.$broadcast('gmMarkersRedraw');
				};

				// Change location as needed
				$scope.selectLocation = function(location, marker) {
					if ($scope.selectable !== "location" && $scope.selectable !== "all") return;

					// Update the location
					$scope.selected = location;
					$scope.focus(); // focus if needed

					// Draw route and set the transport cost
					if($scope.current) {
						mapRouter.fetch($scope.current, $scope.selected).then(function(route) {

							// Draw
							mapRouter.draw(route, $scope.map);

							// Set cost
							if($scope.selected.resources)
								$scope.selected.resources.set(resources.categories.TRANSPORT, resources.types.MONEY, -1 * route.cost);
						});
					}

					// Show label
					$scope.showLabel(location, null, $scope.map);

					// Update the markers being displayed on the map
					$scope.$broadcast('gmMarkersUpdate');
				};

				// Construct an info window for the landmark label
				$scope.infoWindows = {}; // track all info windows
				$scope.clearLabels = function() {
					angular.forEach($scope.infoWindows, function(infoWindow, locationID) {
						infoWindow.close();
					});
				};
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
						url: 'images/markers/marker-grey.png'
						, size: new google.maps.Size(30, 30)
						, origin: new google.maps.Point(0, 0)
						, anchor: new google.maps.Point(15, 15)
					};

					// Selected location marker
					var selectedMarker = {
						url: 'images/markers/marker-orange.png'
						, size: new google.maps.Size(66, 66)
						, origin: new google.maps.Point(0, 0)
						, anchor: new google.maps.Point(33, 33)
					};

					// Current location marker
					var currentMarker = {
						url: 'images/markers/marker-green.png'
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

angular.module('travelPlanningGame.app')
	.directive('randomEventCard', function() {
		return {
			restrict: 'EA'
			, scope: {
				randomEvent: '='
			}
			, templateUrl: 'templates/random-event-card.tpl.html'
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
			, controller: function($scope, $filter, resources, stateTracker) {
				$scope.state = stateTracker.new("resourceIndicatorState_" + $scope.type);
				$scope.state.$transition("active", "idle", 750);

				$scope.currentValue = 0;
				$scope.getValue = function() {
					return $filter("number")($scope.resources.get(resources.categories[$scope.category],
						resources.types[$scope.type]));
				};

				$scope.$watch('getValue()', function(newValue, oldValue) {
					if(newValue && newValue !== oldValue)
						$scope.state.activate();
				});
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
	.controller("BootCtrl", function($scope, mapStyles) {

		$scope.isReady = function() {
			return typeof google !== "undefined";
		};

		$scope.mapStyles = mapStyles;
		$scope.selectedMapStyles = "routeXL";

		$scope.$watch("selectedMapStyles", function(newValue) {
			if(newValue) {
				$scope.customMapStyles = angular.toJson(mapStyles[$scope.selectedMapStyles]);
				window.selectedMapStyles = mapStyles[$scope.selectedMapStyles];
				$scope.$broadcast("event:map:stylesChanged");
			}
		});

		$scope.$watch("customMapStyles", function(newValue) {
			if(newValue) {
				for(var name in mapStyles) {
					if(newValue === angular.toJson(mapStyles[name])) {
						$scope.selectedMapStyles = name;
						$scope.isCustomStyleValid = true;
						return;
					}
				}
			}

			$scope.selectedMapStyles = "";
			if($scope.validate(newValue)) {
				window.selectedMapStyles = angular.fromJson(newValue);
				$scope.$broadcast("event:map:stylesChanged");
			}
		});

		$scope.isCustomStyleValid = true;
		$scope.validate = function(newStyles) {
			try {
				angular.toJson(angular.fromJson(newStyles));
				$scope.isCustomStyleValid = true;
				return true;
			} catch (e) {
				$scope.isCustomStyleValid = false;
				return false;
			}
		};

	});

angular.module("travelPlanningGame.app")
	.controller('GameCtrl', function($scope, $timeout, $q, timer, locations, resources, history,
		randomEvents, stateTracker, mapRouter, angulargmContainer) {

		///////////////////////////
		// Game alert messages //
		///////////////////////////

		var alertMessages = {};
		alertMessages.startLocation = "<h2>Where will you be starting?</h2><p>Select your hotel location on the map.</p>";
		alertMessages.greetings = {};
		alertMessages.greetings.morning = "<h2>Good morning!</h2><p>Where would you like to go today?</p>";
		alertMessages.greetings.afternoon = "<h2>It's the afternoon!</h2><p>Where would you like to go next?</p>";
		alertMessages.greetings.evening = "<h2>Good evening!</h2><p>What's your final destination for today?</p>";

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
			, set: "end"
			, check: "isStats"
		}], "gameState");

		///////////////////////////
		// Game master controls //
		///////////////////////////
		$scope.game = {};

		// Initially (before the game starts)
		mapCities();

		$scope.game.start = function() {
			// Start the game
			$scope.current.state.play();

			// Map the landmarks
			mapLandmarks();

			// Create a resource tracker
			var resourceTracker = resources.new();
			resourceTracker.add(resources.categories.ALL, resources.types.MONEY, $scope.settings.budget);
			resourceTracker.addFilter(resources.categories.VISITING, resources.types.MONEY, 0.5, resources.operations.MULTIPLY, 1);
			$scope.resources = resourceTracker;

			// Initial activities before the player can play turns
			initPlay();
		};
		$scope.game.end = function() {
			// End the game
			$scope.current.state.end();
		};
		$scope.game.menu = function() {
			// Back to the menu
			$scope.current.state.menu();
		};

		$scope.getDay = function() {
			return timer.now() ? timer.now().day : null;
		};

		$scope.setTimeOfDay = function() {
			$scope.displayedTimeOfDay = timer.now() ? timer.toTimeOfDay(timer.now().time) : null;
		};
		$scope.getTimeOfDay = function() {
			return $scope.displayedTimeOfDay;
		};

		/////////////////
		// Game turns //
		/////////////////

		$scope.turnState = stateTracker.new("turnState");

		function initPlay() {
			$scope.alertMessage = alertMessages.startLocation;
			$timeout(function() {
				stateTracker.get("alert").show();
			}, 500);

			// Set map options
			$scope.map.options = $scope.map.playConfig;
			// Notify map to refresh
			$scope.map.state.update();
		}

		// Set the selected location/point as the current start point
		$scope.game.setStartPoint = function() {

			// Update the map config with the start point
			$scope.current.location = $scope.locations.selected;
			$scope.locations.selected = null;
			$scope.map.options.selectable = "location";

			// Notify the map of the update
			$scope.map.state.update();

			// Dismiss the alert
			stateTracker.get("alert").dismiss();

			// Start the timer
			timer.config($scope.settings.travelDays, 3);
			timer.start();

			// Show first greeting
			greet();
		};

		// Check conditions for eligibility for another round
		$scope.game.canPlay = function(giveReason) {
			var deferred = $q.defer();

			// Landmark selected?
			if (!$scope.locations.selected)
				return giveReason ? 'Select a landmark to visit' : false;

			// Everything is permitted in sandbox mode (once a landmark is selected)
			if ($scope.settings.sandboxMode)
				return giveReason ? null : true;

			// Funds left for visiting/travelling/lodging?
			if ($scope.locations.selected.resources) {

				// At a minimum, check for visiting and transport feasibility
				var categoriesRequired = [resources.categories.VISITING, resources.categories.TRANSPORT];

				// If EOD, funds left for lodging?
				if (timer.isEOD())
					categoriesRequired.push(resources.categories.LODGING);

				// Check if we have the funds for this
				if (!resources.canMerge($scope.resources, $scope.locations.selected.resources, categoriesRequired))
					return giveReason ? 'Not enough funds' : false;
			}

			return giveReason ? null : true;
		};

		// Start this turn
		$scope.game.startTurn = function() {

			// Dismiss any greeting
			stateTracker.get("alert").dismiss();

			// Set the selected landmark as the current location
			$scope.current.location = $scope.locations.selected;
			// Restrict further selection to landmarks only
			$scope.map.options.selectable = "location";
			$scope.map.state.update();

			// Charge for visiting costs and experience
			if ($scope.current.location.resources) {

				// For now, account for visiting and transport feasibility
				var categoriesRequired = [resources.categories.VISITING, resources.categories.TRANSPORT];

				resources.merge($scope.resources, $scope.current.location.resources, categoriesRequired);

				// One-time xp points for "discovery"
				if (!history.getInstance("landmarks").find($scope.current.location))
					resources.merge($scope.resources, $scope.current.location.resources, [resources.categories.DISCOVERY]);
			}

			$scope.turnState.activate();
		};

		$scope.game.canShop = function(giveReason) {
			// Funds left?
			if ($scope.current.location.resources) {
				if (!resources.canMerge($scope.resources, $scope.current.location.resources, [resources.categories.SHOPPING]))
					return giveReason ? 'Not enough funds' : false;
			}

			return giveReason ? null : true;
		};

		$scope.game.shop = function() {
			// Update shopping state
			stateTracker.get("shoppingState").purchase();

			$scope.current.

			// Charge for shopping
			resources.merge($scope.resources, $scope.current.location.resources, [resources.categories.SHOPPING]);

			// Record in history
			history.getInstance("shopping").record(timer.toTimestamp(), resources);
		};

		$scope.game.endTurn = function() {
			$scope.turnState.complete();

			// Is this EOD?
			if (timer.isEOD()) {
				// Charge for lodging
				resources.merge($scope.resources, $scope.current.location.resources, [resources.categories.LODGING]);
			}

			// Make a random event, randomly
			if(randomEvents.hasOccurred())
				handleRandomEvent(randomEvents.getEvent());

			// Record today's state in history
			history.getInstance("resources").record(timer.toTimestamp(), resources);
			history.getInstance("landmarks").record(timer.toTimestamp(), $scope.current.location);

			// Days left?
			if (timer.isLast())
				$scope.game.end(); // end game

			// After a tiny gap between turns...
			$timeout(function(){

				// Next turn this day
				timer.next();

				// Un-set as current location [FIXME]
				$scope.locations.selected = null;

				// Show greeting alert
				greet();

			}, 500);
		};

		// Random event
		function handleRandomEvent(randomEvent) {
			if(randomEvent) {
				$scope.randomEvent = randomEvent;

				// Charge for the impact
				resources.merge($scope.resources, randomEvent.resources, [resources.categories.ALL]);

				// If there's an upgrade unlocked?
			}
		}

		// Generic function to execute a "canI ?" function to supply a reason instead of just true/false
		$scope.whyCantI = function(task) {
			return task(true);
		};

		function greet(canGreet) {
			// Enqueue our intent to show until the current alert has been dismissed
			if(!canGreet) {
				$scope.alertUnbinder = stateTracker.get("alert").$on("off", function() {
					greet(true);
				});
			}

			// When we can, show the alert asap
			else {
				$scope.setTimeOfDay();

				$scope.alertMessage = alertMessages.greetings[$scope.getTimeOfDay()];

				if(angular.isFunction($scope.alertUnbinder))
					$scope.alertUnbinder();
				$scope.alertUnbinder = null;

				stateTracker.get("alert").show();
			}
		}

		///////////////
		// Locations //
		///////////////

		$scope.locations = {};

		// Load the cities
		$scope.locations.cities = null; // cities
		locations.getCities().then(function(data) {
			$scope.locations.cities = data;
		});

		// Show the cities on the map
		function mapCities() {
			locations.getCities().then(function(data) {
				$scope.locations.cities = data;

				// Current status
				$scope.current.location = $scope.locations.cities[0];

				// Supply to the map
				$scope.map.initConfig.locations = $scope.locations.cities;
				// Notify update
				$scope.map.state.update();
			});
		}

		// Load the landmarks
		$scope.locations.landmarks = null; // landmarks
		locations.getLandmarks().then(function(data) {
			$scope.locations.landmarks = data;
		});

		// Show the landmarks on the map
		function mapLandmarks() {
			locations.getLandmarks().then(function(data) {
				$scope.locations.landmarks = data;

				// Current status
				$scope.current.location = null;

				// Supply to the map
				$scope.map.playConfig.locations = $scope.locations.landmarks;
				// Notify update
				$scope.map.state.update();
			});
		}

		// Currently selected location (city or landmark)
		$scope.locations.selected = null; // selected landmark for whatever reason

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

		// Available map configurations
		$scope.map.playConfig = {
			zoom: "auto" // number or auto
			, locations: null
			, selectable: "all" // all, point, location, none
			, focusOn: "auto" // auto, selected, current
			, disabled: false
			, showTransit: false
		};

		$scope.map.initConfig = {
			zoom: 1 // number or auto
			, locations: null
			, selectable: "none" // all, point, location, none
			, focusOn: "auto" // auto, selected, current
			, disabled: false
			, showTransit: false
		};

		// Currently active map configuration
		$scope.map.options = $scope.map.initConfig; // use initial configuration

	});

angular.module('travelPlanningGame.templates', ['templates/landmark-card.tpl.html', 'templates/loading.tpl.html', 'templates/maps.game.tpl.html', 'templates/random-event-card.tpl.html', 'templates/widgets.alert.tpl.html', 'templates/widgets.day-counter.tpl.html', 'templates/widgets.resource-indicator.tpl.html']);

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

angular.module('templates/loading.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/loading.tpl.html',
    '<div class="spinner">\n' +
    '	<div class="bounce1"></div>\n' +
    '	<div class="bounce2"></div>\n' +
    '	<div class="bounce3"></div>\n' +
    '</div>\n' +
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
    '		gm-on-click="selectLocation(object, marker)">\n' +
    '	</div>\n' +
    '	<div id="map-infoWindow-markerLabel-sample">\n' +
    '		<div class="well">\n' +
    '			<strong>{{ location.name }}</strong>\n' +
    '		</div>\n' +
    '	</div>\n' +
    '</div>\n' +
    '');
}]);

angular.module('templates/random-event-card.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/random-event-card.tpl.html',
    '<!-- Event card -->\n' +
    '<div class="random-event-card panel panel-default random-event-{{ randomEvent.type }} animated"\n' +
    '	state-tracker="randomEventCardState"\n' +
    '	state-class="[\'hide\', \'bounceIn\', \'bounceOut\', \'hide\']"\n' +
    '	state-activate="randomEvent"\n' +
    '	state-on-failed="randomEvent = null"\n' +
    '	state-transition="{complete: {failed: 1000}, failed: {idle: 500}}">\n' +
    '\n' +
    '	<!-- Event name and controls -->\n' +
    '	<div class="panel-header panel-heading">\n' +
    '		<h3 ng-if="randomEvent.type === \'POSITIVE\'">Hang on, something great happened today!</h3>\n' +
    '		<h3 ng-if="randomEvent.type === \'NEGATIVE\'">Uh-oh! Something bad happened today!</h3>\n' +
    '	</div>\n' +
    '	<!-- end name and controls -->\n' +
    '\n' +
    '	<!-- Flavour text -->\n' +
    '	<div class="panel-body">\n' +
    '		<h2>{{ randomEvent.description }}</h2>\n' +
    '	</div>\n' +
    '	<!-- end text -->\n' +
    '\n' +
    '	<!-- Impact -->\n' +
    '	<div class="panel-footer">\n' +
    '		<h3>{{ randomEvent.impact }}</h3>\n' +
    '		<p>\n' +
    '			<button type="button" class="btn btn-default" ng-click="randomEventCardState.complete()">Okay</button>\n' +
    '		</p>\n' +
    '	</div>\n' +
    '	<!-- end impact -->\n' +
    '\n' +
    '</div>\n' +
    '<!-- end card -->\n' +
    '');
}]);

angular.module('templates/widgets.alert.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/widgets.alert.tpl.html',
    '<div class="widget-alert" ng-bind-html="content"></div>\n' +
    '<div class="chevron fa fa-caret-down" ng-if="chevron"></div>');
}]);

angular.module('templates/widgets.day-counter.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/widgets.day-counter.tpl.html',
    '<div class="widget-day-counter animated rotateInDownRight" ng-if="now.day">\n' +
    '	<div class="content">\n' +
    '		<h1>Day</h1>\n' +
    '		<h1>{{ now.day | number }}\n' +
    '			<small>/ {{ limits.days }}</small>\n' +
    '		</h1>\n' +
    '	</div>\n' +
    '</div>\n' +
    '');
}]);

angular.module('templates/widgets.resource-indicator.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/widgets.resource-indicator.tpl.html',
    '<div class="widget-resource-indicator"\n' +
    '	ng-class="\'widget-resource-indicator-\' + type"\n' +
    '	state-tracker="resourceIndicatorState_{{ type }}"\n' +
    '	state-class="[\'\', \'animated tada\', \'\', \'\']">\n' +
    '	<i class="widget-resource-indicator-icon fa fa-fw fa-3x" ng-class="\'fa-\' + icon"></i>\n' +
    '	<span class="widget-resource-indicator-value" ng-bind="getValue()"></span>\n' +
    '</div>\n' +
    '');
}]);
