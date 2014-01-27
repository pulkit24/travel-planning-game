'use strict';

angular.module('travelPlanningGame.maps')
	.factory('mapRouter', function($q, $timeout, rome2rio, history) {

		///////////////////////
		// Route providers //
		///////////////////////

		var providers = {
			rome2rio: 1
			, google: 2
		};
		var currentProvider = providers.google;

		function chooseRouteProvider(provider) {
			currentProvider = provider;
		}

		/////////////////////////
		// Routing providers //
		/////////////////////////

		var RouteProvider = function(provider, from, to) {
			// Get routing and drawing functions from the
			// required providers
			switch (provider) {
				case providers.rome2rio:
					angular.extend(this, new Rome2RioRouteProvider(provider, from, to));
					break;
				case providers.google:
					angular.extend(this, new GoogleRouteProvider(provider, from, to));
			}
		};

		var Rome2RioRouteProvider = function(provider, from, to) {
			this._from = from;
			this._to = to;

			this.route = function() {
				var deferred = $q.defer();

				rome2rio.search(
					this._from.name, this._to.name, rome2rio.toPosition(
						this._from.coords.lat, this._from.coords.lng
					), rome2rio.toPosition(
						this._to.coords.lat, this._to.coords.lng
					)
				)
					.then(function(routes) {
						deferred.resolve(routes);
					});

				return deferred.promise;
			};
		};

		var GoogleRouteProvider = function(provider, from, to) {
			this._from = from;
			this._to = to;

			this.route = function() {
				var deferred = $q.defer();

				// Fetch route from Google
				new google.maps.DirectionsService().route({
					origin: rome2rio.toPosition(this._from.coords.lat, this._from.coords.lng)
					, destination: rome2rio.toPosition(this._to.coords.lat, this._to.coords.lng)
					, travelMode: google.maps.TravelMode.DRIVING
				}, function(result, status) {
					if (status === google.maps.DirectionsStatus.OK) {
						deferred.resolve(result);
					}
				});

				return deferred.promise;
			};
		};

		//////////////////////
		// Route handlers //
		//////////////////////

		var Route = function(provider, routes, drawn) {
			// Get cost and drawing functions from the
			// required providers
			switch (provider) {
				case providers.rome2rio:
					angular.extend(this, new Rome2RioRoute(routes, drawn));
					break;
				case providers.google:
					angular.extend(this, new GoogleRoute(routes, drawn));
			}
		};

		var Rome2RioRoute = function(routes, drawn) {
			this._routes = routes;
			this._drawn = drawn ? drawn : [];

			this.getCost = function() {
				if (this._routes)
					return this._routes.costs;
				else
					return null;
			};

			this.draw = function(map) {
				if (this._routes) {
					var _drawn = [];
					angular.forEach(this._routes.paths, function(path, index) {
						var drawnPath = new google.maps.Polyline({
							strokeColor: '#3ABA3A'
							, strokeOpacity: 1.0
							, strokeWeight: 5
							, map: map
							, path: google.maps.geometry.encoding.decodePath(path)
						});
						_drawn.push(drawnPath);
					});
					this._drawn = _drawn;
				} else
					return null;
			};

			this.clear = function() {
				angular.forEach(this._drawn, function(drawnPath, index) {
					drawnPath.setMap(null);
				});
			};
		};

		var GoogleRoute = function(routes, drawn) {
			this._routes = routes;
			this._drawn = drawn ? drawn : null;

			this.getCost = function() {
				return null;
			};

			this.draw = function(map) {
				if (this._routes) {
					this._drawn = new google.maps.DirectionsRenderer({
						suppressMarkers: true
						, suppressInfoWindows: true
						, polylineOptions: {
							clickable: false
							, strokeColor: '#3ABA3A'
							, strokeOpacity: 1.0
							, strokeWeight: 5
						}
					});
					this._drawn.setMap(map);
					this._drawn.setDirections(this._routes);
				} else
					return null;
			};

			this.clear = function() {
				if(this._drawn)
					this._drawn.setMap(null);
			};
		};

		/////////////////////////
		// Route management //
		/////////////////////////

		var routingHistory = {
			history: {}
			, record: function(id, route) {
				history[id] = route;
			}
			, retrieve: function(id) {
				return history[id];
			}
			, retrieveAll: function() {
				return history;
			}
		};

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
			var route = routingHistory.retrieve(_routeIdentifier(from, to));
			if(route)
				return new Route(currentProvider, route._routes, route._drawn);
			else
				return null;
		}

		// Fetch a route, and return a promise
		function fetchRoute(from, to) {
			var deferred = $q.defer();

			$timeout(function() {
				var routeObject = routingHistory.retrieve(_routeIdentifier(from, to));
				if (routeObject) {
					deferred.resolve(new Route(currentProvider, routeObject._routes, routeObject._drawn));

				} else {
					new RouteProvider(currentProvider, from, to).route().then(function(rawRoute) {
						var routeObject = new Route(currentProvider, rawRoute);

						routingHistory.record(_routeIdentifier(from, to), routeObject);

						deferred.resolve(routeObject);
					});
				}
			}, 0);

			return deferred.promise;
		}

		function fetchAllRoutes(endPoints) {
			angular.forEach(endPoints, function(from, index) {
				angular.forEach(endPoints, function(to, index) {
					if (from !== to && !routingHistory.retrieve(_routeIdentifier(from, to))) {
						fetchRoute(from, to);
					}
				});
			});
		}

		function clearAll() {
			angular.forEach(routingHistory.retrieveAll(), function(route, id) {
				new Route(currentProvider, route._routes, route._drawn).clear();
			});
		}

		return {
			providers: providers
			, use: chooseRouteProvider
			, prefetch: fetchAllRoutes
			, fetchRoute: fetchRoute
			, getRoute: getRoute
			, clearAll: clearAll
		};
	});
