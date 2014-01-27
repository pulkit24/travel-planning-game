'use strict';

angular.module('travelPlanningGame.maps')
	.factory('mapRouter', function($q, rome2rio, history) {

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

		////////////////
		// Routes  //
		////////////////

		var Route = function(provider) {
			// Get routing and drawing functions from the
			// required providers
			switch (provider) {
				case providers.rome2rio:
					angular.extend(this, new Rome2RioRoute());
					break;
				case providers.google:
					angular.extend(this, new GoogleRoute());
			}
		};

		var Rome2RioRoute = function() {
			this._routes = null;

			this.route = function(from, to) {
				var deferred = $q.defer();
				var self = this;

				rome2rio.search(
					from.name, to.name, rome2rio.toPosition(
						from.coords.lat, from.coords.lng
					), rome2rio.toPosition(
						to.coords.lat, to.coords.lng
					)
				)
					.then(function(routes) {
						self._routes = routes;
						deferred.resolve(self);
					});

				return deferred.promise;
			};

			this.getCost = function() {
				if (this._routes)
					return this._routes.getCost();
				else
					return null;
			};

			this.draw = function(map) {
				if (this._routes) {
					angular.forEach(this._routes.getPaths(), function(path, index) {
						new google.maps.Polyline({
							strokeColor: '#3ABA3A'
							, strokeOpacity: 1.0
							, strokeWeight: 5
							, map: map
							, path: google.maps.geometry.encoding.decodePath(path)
						});
					});
				} else
					return null;
			};
		};

		var GoogleRoute = function() {
			this._routes = null;

			this.route = function(from, to) {
				var deferred = $q.defer();
				var self = this;

				// Fetch route from Google
				new google.maps.DirectionsService().route({
					origin: rome2rio.toPosition(from.coords.lat, from.coords.lng)
					, destination: rome2rio.toPosition(to.coords.lat, to.coords.lng)
					, travelMode: google.maps.TravelMode.DRIVING
				}, function(result, status) {
					if (status === google.maps.DirectionsStatus.OK) {
						self._routes = result;
						deferred.resolve(self);
					}
				});

				return deferred.promise;
			};

			this.getCost = function() {
				return null;
			};

			this.draw = function(map) {
				if (this._routes) {
					var rendered = new google.maps.DirectionsRenderer();
					rendered.setMap(map);
					rendered.setDirections(this._routes);
				} else
					return null;
			};
		};

		/////////////////////////
		// Route management //
		/////////////////////////

		var routingHistory = history.getInstance("mapRouter");

		// Add to history
		function saveRoute(id, route) {
			return routingHistory.record(id, route);
		}

		// Retrieve from history
		function restoreRoute(id) {
			return routingHistory.retrieve(id);
		}

		function _marshalLocations(locationA, locationB) {
			var idA = locationA.id;
			var idB = locationB.id;
			if (idA < idB)
				return idA + "," + idB;
			else
				return idB + "," + idA;
		}

		function getRoute(fromLocation, toLocation) {
			var router = restoreRoute(_marshalLocations(fromLocation, toLocation));
			if(!router)
				router = new Route(currentProvider);
			return router.route(fromLocation, toLocation);
		}

		return {
			providers: providers
			, use: chooseRouteProvider
			, route: getRoute
		};
	});
