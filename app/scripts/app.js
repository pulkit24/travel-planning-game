'use strict';

angular.module('travelPlanningGame.app', [
	'ngCookies', 'ngResource', 'ngSanitize', 'ngRoute', 'ui.bootstrap', 'angular-underscore',
	'angular-rome2rio', 'travelPlanningGame.settings', 'travelPlanningGame.maps',
	'travelPlanningGame.widgets', 'travelPlanningGame.templates'
])
	.config(function($routeProvider, rome2rioProvider) {
		$routeProvider.when('/start', {
			templateUrl: 'views/start.html'
			, controller: 'StartCtrl'
		})
			.when('/play', {
				templateUrl: 'views/play.html'
				, controller: 'PlayCtrl'
			})
			.when('/end', {
				templateUrl: 'views/end.html'
				, controller: 'EndCtrl'
			})
			.otherwise({
				redirectTo: '/start'
			});

		// Configure the Rome2Rio API
		rome2rioProvider.setKey('uuSKZSEU');
		rome2rioProvider.setServer('free.rome2rio.com');
		rome2rioProvider.setResponseFormat('json');
		rome2rioProvider.setAPIVersion('1.2');
		rome2rioProvider.setCurrency('AUD');
		rome2rioProvider.setDetailLevel('street_address');
	});