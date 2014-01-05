'use strict';

angular.module('travelPlanningGame.app')
	.controller('PlayCtrl', function($scope, gameSettings, landmarks) {
		$scope.settings = {};
		$scope.landmarks = [];
		$scope.play = {};

		// Init
		function init() {
			$scope.settings.game = gameSettings.getSettings();
			$scope.landmarks = landmarks.getLandmarks();
			$scope.play.settings = {};
			$scope.play.settings.finances = {};
			$scope.play.settings.finances.totalExpense = 0;
			$scope.play.settings.finances.budget = $scope.settings.game.finances.budget - $scope.play.settings.finances.totalExpense;
		}
		init();

	});
