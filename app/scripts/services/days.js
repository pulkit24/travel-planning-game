'use strict';

angular.module('travelPlanningGame.app')
	.factory('days', function($filter, bankingManager) {
		var days = [];

		var daysFactory = {};
		daysFactory.getAllDays = function() {
			return days;
		};
		daysFactory.getDay = function(index) {
			return days[index];
		};
		daysFactory.newDay = function(finances) {
			var day = {};
			day.finances = finances;
			day.landmarksVisited = []; // list of landmark objects (see landmarks service)

			day.toTimestamp = function() {
				return "day" + days.length;
			};
			day.addLandmark = function(landmark) {
				this.landmarksVisited.push(landmark);
				if (!isLandmarkVisited(landmark)) {
					this.finances.addGain(landmark.exp, bankingManager.types.XP, bankingManager.categories.ONETIME,
						this.toTimestamp());
				}
				this.finances.addGain(landmark.visitingExp, bankingManager.types.XP, bankingManager.categories
					.VISITING, this.toTimestamp());
				this.finances.addExpense(landmark.visitingCost, bankingManager.types.MONEY, bankingManager.categories
					.VISITING, this.toTimestamp());
				this.finances.addExpense(landmark.lodgingCost, bankingManager.types.MONEY, bankingManager.categories
					.LODGING, this.toTimestamp());
				return this;
			};
			day.addShopping = function(itemsBought, cost) {
				this.finances.addExpense(cost, bankingManager.types.MONEY, bankingManager.categories.SHOPPING,
					this.toTimestamp());
				this.finances.addGain(itemsBought, bankingManager.types.SOUVENIR, bankingManager.categories.SHOPPING,
					this.toTimestamp());
				return this;
			};
			day.end = function() {
				days.push(this);
				return day;
			};
			day.skip = function(currentDayIndex) {
				var previousDayIndex = currentDayIndex - 1;
				if (previousDayIndex >= 0) {
					var previousLandmarks = days[previousDayIndex].landmarksVisited;
					var currentLandmark = previousLandmarks[previousLandmarks.length - 1];
					this.finances.addExpense(currentLandmark.lodgingCost, bankingManager.types.MONEY,
						bankingManager.categories.LODGING, this.toTimestamp());
				}
				days.push(this);
				return day;
			};

			return day;
		};

		function isLandmarkVisited(landmark) {
			var matchedDay = $filter('find')(days, function(day) {
				return $filter('find')(day.landmarksVisited, function(landmarkVisited) {
					return landmarkVisited.id === landmark.id;
				});
			});

			return angular.isDefined(matchedDay);
		}

		return daysFactory;
	});
