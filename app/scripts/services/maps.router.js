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
