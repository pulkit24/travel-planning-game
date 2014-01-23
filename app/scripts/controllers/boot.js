angular.module("travelPlanningGame.app")
	.controller("BootCtrl", function($scope) {
		$scope.isReady = function() {
			return angular.isDefined(google);
		};
	});
