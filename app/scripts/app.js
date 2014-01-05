'use strict';

angular.module('travelPlanningGame.app', [
	'ngCookies'
	, 'ngResource'
	, 'ngSanitize'
	, 'ngRoute'
	, 'ui.bootstrap'
	, 'travelPlanningGame.settings'
	, 'travelPlanningGame.maps'
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
				redirectTo: '/play'
			});
	});
