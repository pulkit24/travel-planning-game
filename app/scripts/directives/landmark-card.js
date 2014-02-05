'use strict';

angular.module('travelPlanningGame.app')
	.directive('landmarkCard', function() {
		return {
			restrict: 'EA'
			, transclude: true
			, scope: {
				landmark: '='
			}
			, templateUrl: 'templates/landmark-card.tpl.html'
			, controller: function($scope, history) {
				$scope.isVisited = function() {
					return history.getInstance("landmarks").find($scope.landmark) !== null;
				};
			}
		};
	});
