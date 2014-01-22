'use strict';

angular.module('travelPlanningGame.app')
	.factory('landmarks', function($http, $q) {

		var landmarks = null;

		function load() {
			var deferred = $q.defer();

			if (landmarks)
				deferred.resolve();

			else {
				$http.get("landmarks.json").success(function(data) {
					landmarks = data;
					deferred.resolve();
				}).error(function(data) {
					landmarks = [];
					deferred.reject();
				});
			}

			return deferred.promise;
		}

		return {
			get: load
		};
	});
