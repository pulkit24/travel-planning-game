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
		};
	});
