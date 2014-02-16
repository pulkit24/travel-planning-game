'use strict';

angular.module('travelPlanningGame.app')
	.directive('randomEventCard', function() {
		return {
			restrict: 'EA'
			, scope: {
				randomEvent: '='
			}
			, templateUrl: 'templates/random-event-card.tpl.html'
			, controller: function($scope) {
				$scope.close = function() {
					$scope.$emit("tpg:event:eventCard:close");
				};
			}
		};
	});