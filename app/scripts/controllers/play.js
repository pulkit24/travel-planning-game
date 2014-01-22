'use strict';

angular.module('travelPlanningGame.app')
	.controller('PlayCtrl', function($scope, gameSettings, landmarks, days, bankingManager) {
		$scope.settings = {};
		$scope.landmarks = [];
		$scope.play = {};

		// Init
		function init() {
			$scope.settings.game = gameSettings.getSettings();
			$scope.landmarks = landmarks.get();
			$scope.play.settings = {};
			$scope.play.finances = bankingManager.manage("playFinances", $scope.settings.game.finances.budget);
			$scope.play.day = 1;
		}
		init();

		// Check conditions for eligibility for another round
		$scope.canPlay = function(giveReason) {
			// Landmark selected?
			if (!$scope.selectedLandmark) {
				return giveReason ? 'Select a landmark to visit.' : false;
			}

			// Everything is permitted in sandbox mode (once a landmark is selected)
			if ($scope.settings.game.sandboxMode) {
				return true;
			}

			// Days left?
			if ($scope.play.day >= $scope.settings.game.daysOfTravel) {
				return giveReason ? 'Your trip is over.' : false;
			}

			// Funds left?
			if ($scope.play.finances.getBudget() < ($scope.selectedLandmark.visitingCost + $scope.selectedLandmark.lodgingCost)) {
				return giveReason ? 'Not enough funds for this landmark.' : false;
			}

			return giveReason ? 'I don\'t know, you should be able to!' : true;
		};

		$scope.whyCantIPlay = function() {
			return $scope.canPlay(true);
		};

		// Complete a day
		$scope.simulateDay = function() {
			// Simulate a new day
			var day = days.newDay($scope.play.day, $scope.play.finances)
				.addLandmark($scope.selectedLandmark)
				.end();

			// On to the next day
			$scope.play.day++;
			$scope.selectedLandmark = null;
		};

		$scope.skipDay = function() {
			// Simulate a new day
			var day = days.newDay($scope.play.day, $scope.play.finances)
				.skip($scope.play.day - 1);

			// On to the next day
			$scope.play.day++;
		};

	});
