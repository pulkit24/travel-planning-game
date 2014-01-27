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
			, controller: function($scope, $filter, resources) {
				$scope.getValue = function() {
					return $filter("number")($scope.resources.get(resources.categories[$scope.category],
						resources.types[$scope.type]));
				};
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
