'use strict';

angular.module('travelPlanningGame.app')
	.directive('landmarkCard', function() {
		return {
			restrict: 'EA'
			, scope: {
				landmark: '='
			}
			, templateUrl: '../../templates/landmark-card.tpl.html'
		};
	});
