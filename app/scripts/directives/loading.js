'use strict';

angular.module('travelPlanningGame.app')
	.directive('loading', function() {
		return {
			restrict: 'EA'
			, templateUrl: 'templates/loading.tpl.html'
		};
	});
