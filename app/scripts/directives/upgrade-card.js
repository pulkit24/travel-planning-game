'use strict';

angular.module('travelPlanningGame.app')
	.directive('upgradeCard', function() {
		return {
			restrict: 'EA'
			, scope: {
				upgrade: '='
			}
			, templateUrl: 'templates/upgrade-card.tpl.html'
			, controller: function($scope) {
				$scope.close = function() {
					$scope.$emit("tpg:event:upgradeCard:close");
				};
			}
		};
	});
