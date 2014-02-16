'use strict';

angular.module('travelPlanningGame.app')
	.directive('landmarkView', function() {
		return {
			restrict: 'EA'
			, transclude: true
			, scope: {
				landmark: '='
			}
			, templateUrl: 'templates/landmark-view.tpl.html'
			, controller: function($scope) {
			}
		};
	});
