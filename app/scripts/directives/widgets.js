'use strict';

angular.module('travelPlanningGame.widgets')
	.directive('widgetResourceIndicator', function() {
		return {
			restrict: 'EA'
			, templateUrl: 'templates/widgets.resource-indicator.tpl.html'
			, scope: {
				value: '='
				, role: '@'
			}
			, link: function(scope, elem, attrs) {
				scope.icon = scope.role === 'budget' ? 'dollar' : (scope.role === 'xp' ? 'star' : 'shopping-cart');
			}
			, controller: function($scope, $filter) {

				$scope.getValue = function() {
					return $filter("number")($scope.value);
				};
			}
		};
	})
	.directive('widgetDayCounter', function() {
		return {
			restrict: 'EA'
			, templateUrl: 'templates/widgets.day-counter.tpl.html'
			, scope: {
				value: '='
				, total: '='
			}
		};
	});
