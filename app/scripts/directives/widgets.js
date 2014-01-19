'use strict';

angular.module('travelPlanningGame.widgets')
	.directive('widgetResourceIndicator', function() {
		return {
			restrict: 'EA'
			, templateUrl: 'templates/widgets.resource-indicator.tpl.html'
			, scope: {
				ngModel: '='
				, role: '@'
			}
			, link: function(scope, elem, attrs) {
				scope.icon = scope.role === 'budget' ? 'dollar' : (scope.role === 'xp' ? 'star' : 'shopping-cart');
			}
			, controller: function($scope, $filter) {

				$scope.getValue = function() {
					return $filter("number")($scope.ngModel);
				};
			}
		};
	})
	.directive('widgetDayCounter', function() {
		return {
			restrict: 'EA'
			, templateUrl: 'templates/widgets.day-counter.tpl.html'
			, scope: {
				ngModel: '='
				, total: '='
			}
		};
	});
