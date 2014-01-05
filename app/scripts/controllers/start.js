'use strict';

angular.module('travelPlanningGame.app')
	.controller('StartCtrl', function($scope, gameSettings) {
		$scope.settings = {};

		// Init
		function init() {
			$scope.settings.game = gameSettings.getSettings();
		}
		init();
	});
