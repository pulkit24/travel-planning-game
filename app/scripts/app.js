'use strict';

angular.module('travelPlanningGame.app', [
	'ngCookies'
	, 'ngResource'
	, 'ngSanitize'
	, 'ngRoute'
	, 'ui.bootstrap'
	, 'angular-underscore'
	, 'travelPlanningGame.settings'
	, 'travelPlanningGame.maps'
	, 'travelPlanningGame.widgets'
	, 'travelPlanningGame.templates'
])
	.config(function($routeProvider) {
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
	});
