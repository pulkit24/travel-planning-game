'use strict';

angular.module('travelPlanningGame.app')
	.directive('itemCard', function() {
		return {
			restrict: 'EA'
			, transclude: true
			, scope: {
				item: '='
			}
			, templateUrl: 'templates/item-card.tpl.html'
		};
	});
