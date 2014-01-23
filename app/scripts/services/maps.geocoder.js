'use strict';

angular.module('travelPlanningGame.maps')
	.factory('mapGeocoder', function($q, angulargmUtils) {
		if(angular.isUndefined(google)) return {};

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
				deferred.resolve(angulargmUtils.latLngToObj(
					results[0].geometry.location
				));
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
				deferred.resolve(results[0].formatted_address);
			});

			return deferred.promise;
		};

		return mapGeocoder;
	});
