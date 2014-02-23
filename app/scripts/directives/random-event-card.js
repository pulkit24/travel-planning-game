'use strict';

angular.module('travelPlanningGame.app')
	.directive('randomEventCard', function() {
		return {
			restrict: 'EA'
			, scope: {
				randomEvent: '='
			}
			, templateUrl: 'templates/random-event-card.tpl.html'
			, controller: function($scope, randomEvents) {

				$scope.close = function() {
					$scope.$emit("tpg:event:eventCard:close");
				};

				$scope.currentCounter = null;
				$scope.getCurrentCounter = function() {
					$scope.currentCounter = randomEvents.getAvailableCounterTo($scope.randomEvent);
					return $scope.currentCounter;
				};
			}
		};
	});
