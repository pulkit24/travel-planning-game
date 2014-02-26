'use strict';

angular.module('travelPlanningGame.widgets')
	.directive('widgetResourceIndicator', function() {
		return {
			restrict: 'EA'
			, templateUrl: 'templates/widgets.resource-indicator.tpl.html'
			, scope: {
				resources: '='
				, type: '@'
				, category: "@"
			}
			, link: function(scope, elem, attrs) {
				scope.icon = scope.type === 'MONEY' ? 'dollar' : (scope.type === 'XP' ? 'star' :
					'shopping-cart');
			}
			, controller: function($scope, $filter, $timeout, resources) {

				$scope.getRawValue = function() {
					return $scope.resources.get(resources.categories[$scope.category],
						resources.types[$scope.type]);
				};

				var countdownStepTime = 35; // ms
				var countdownJumps = 10; // max no. of steps to take

				function countdown(target, step) {
					if($scope.currentValue - target >= step)
						$scope.currentValue -= step;
					else if(target - $scope.currentValue >= step)
						$scope.currentValue += step;
					else {
						$scope.currentValue = target;
						return;
					}

					$timeout(function() {
						countdown(target, step);
					}, countdownStepTime);
				}

				function computeCountdownStep(current, target) {
					var gap = Math.abs(current - target);
					return gap > countdownJumps ? parseInt(gap / countdownJumps, 10) : 1;
				}

				$scope.currentValue = $scope.getRawValue();

				// Floating notices of updated values
				$scope.updates = [];

				$scope.$watch('getRawValue()', function(newValue, oldValue) {
					if(angular.isDefined(newValue) && angular.isDefined(oldValue) && newValue !== oldValue) {
						var step = computeCountdownStep($scope.currentValue, newValue);
						countdown(newValue, step);
						$scope.updates.push(parseInt(newValue, 10) - parseInt(oldValue, 10));
					}
				});
			}
		};
	})
	.directive('widgetDayCounter', function() {
		return {
			restrict: 'EA'
			, templateUrl: 'templates/widgets.day-counter.tpl.html'
			, scope: {
				day: "="
			}
			, controller: function($scope, timer) {

				$scope.$watch("day", function(newValue) {
					$scope.now = timer.now();
					$scope.limits = timer.getLimits();
				});

				$scope.getTimeOfDay = function() {
					return timer.now() ? timer.toTimeOfDay(timer.now().time) : null;
				};
			}
		};
	})
	.directive('widgetAlert', function() {
		return {
			restrict: 'EA'
			, templateUrl: 'templates/widgets.alert.tpl.html'
			, scope: {
				content: "=widgetAlert"
				, chevron: "@"
			}
			, controller: function($scope) {
			}
		};
	});
