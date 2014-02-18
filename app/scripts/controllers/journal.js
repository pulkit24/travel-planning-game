angular.module("travelPlanningGame.app")
	.controller('JournalCtrl', function($scope, $timeout, $q, timer, locations, resources, history,
		randomEvents, upgrades) {

		$scope.getTotalLandmarks = function() {
			return locations.getNow("landmarks").length;
		};
		$scope.getTotalItems = function() {
			return locations.getNow("landmarks").length; // each landmark has one unique item
		};
		$scope.getVisitedLandmarks = function() {
			var visited = history.getInstance("landmarks").retrieveAll();
			var uniqueVisited = {};
			var totalVisited = 0;
			angular.forEach(visited, function(landmarkID, timestamp) {
				if(!uniqueVisited[landmarkID]) {
					totalVisited += 1;
					uniqueVisited[landmarkID] = landmarkID;
				}
			});
			return totalVisited;
		};
		$scope.getBoughtItems = function() {
			var bought = history.getInstance("souvenirs").retrieveAll();
			var uniqueVisited = {};
			var totalVisited = 0;
			angular.forEach(bought, function(item, timestamp) {
				if(!uniqueVisited[item.name]) {
					totalVisited += 1;
					uniqueVisited[item.name] = item;
				}
			});
			return totalVisited;
		};
		$scope.hasBought = function(item) {
			var boughtItems = history.getInstance("souvenirs").retrieveAll();
			var matchFound = false;
			angular.forEach(boughtItems, function(boughtItem, timestamp) {
				if(boughtItem.name === item.name)
					matchFound = true;
			});
			return matchFound;
		};
	});