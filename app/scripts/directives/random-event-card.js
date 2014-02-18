'use strict';

angular.module('travelPlanningGame.app')
	.directive('randomEventCard', function() {
		return {
			restrict: 'EA'
			, scope: {
				randomEvent: '='
			}
			, templateUrl: 'templates/random-event-card.tpl.html'
			, controller: function($scope, upgrades) {

				$scope.close = function() {
					$scope.$emit("tpg:event:eventCard:close");
				};

				$scope.currentCounter = null;
				$scope.getCurrentCounter = function() {
					if(!$scope.randomEvent) {
						$scope.currentCounter = null;
						return null;
					}

					// Get the current counters
					var counters = $scope.randomEvent.counteredBy;
					if(!angular.isArray(counters))
						counters = [counters];
					for(var i = 0, len = counters.length; i < len; i++) {
						var counter = upgrades.get(counters[i]);
						if(counter && counter.isUnlocked) {
							$scope.currentCounter = counter;
							return counter; // if any one of the counters is already unlocked
						}
					}

					$scope.currentCounter = null;
					return null;
				};
			}
		};
	});
