'use strict';

angular.module('travelPlanningGame.app')
	.factory('days', function($filter) {
		var days = [];

		var daysFactory = {};
		daysFactory.getAllDays = function() {
			return days;
		};
		daysFactory.getDay = function(index) {
			return days[index];
		};
		daysFactory.newDay = function(budget) {
			var day = {};
			day.finances = {};
			day.finances.budget = budget; // in $
			day.finances.expenses = {};
			day.finances.expenses.general = 0; // food, lodging etc., in $
			day.finances.expenses.shopping = 0; // in $
			day.finances.expenses.random = 0; // from random events, in $
			day.landmarksVisited = []; // list of landmark objects (see landmarks service)
			day.gains = {};
			day.gains.xp = 0; // experience points gained
			day.gains.souvenirs = 0; // number of items purchased by shopping

			day.addLandmark = function(landmark) {
				this.landmarksVisited.push(landmark);
				if(!isLandmarkVisited(landmark)) {
					this.gains.xp += landmark.exp;
				}
				this.gains.xp += landmark.visitingExp;
				this.finances.expenses.general += landmark.visitingCost + landmark.lodgingCost;
				return this;
			};
			day.addGeneralExpense = function(expense) {
				this.finances.expenses.general += expense;
				return this;
			};
			day.addShopping = function(itemsBought, cost) {
				this.finances.expense.shopping += cost;
				this.gains.souvenirs += itemsBought;
				return this;
			};
			day.end = function() {
				days.push(this);
				return day;
			};
			day.skip = function(currentDayIndex) {
				var previousDayIndex = currentDayIndex - 1;
				if(previousDayIndex >= 0) {
					var previousLandmarks = days[previousDayIndex].landmarksVisited;
					var currentLandmark = previousLandmarks[previousLandmarks.length - 1];
					this.finances.expenses.general += currentLandmark.lodgingCost;
				}
				days.push(this);
				return day;
			};
			day.getTotalExpenses = function() {
				return this.finances.expenses.general + this.finances.expenses.shopping + this.finances.expenses.random;
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
