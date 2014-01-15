'use strict';

angular.module('travelPlanningGame.app')
	.controller('PlayCtrl', function($scope, gameSettings, landmarks, days) {
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
			$scope.play.settings.finances.funds = $scope.settings.game.finances.budget - $scope.play.settings.finances.totalExpense;

			$scope.play.settings.gains = {};
			$scope.play.settings.gains.xp = 0;
			$scope.play.settings.gains.souvenirs = 0;

			$scope.play.day = 1;
		}
		init();

		// Complete a day
		$scope.simulateDay = function() {
			// Simulate a new day
			var day = days.newDay($scope.play.settings.finances.budget)
				.addLandmark($scope.selectedLandmark)
				.end();

			// Note the repurcussions, if any
			$scope.play.settings.finances.totalExpense += day.getTotalExpenses();
			$scope.play.settings.finances.funds = $scope.settings.game.finances.budget - $scope.play.settings.finances.totalExpense;
			$scope.play.settings.gains.xp += day.gains.xp;
			$scope.play.settings.gains.souvenirs += day.gains.souvenirs;

			// On to the next day
			$scope.play.day++;
			$scope.selectedLandmark = null;
		};

	});
