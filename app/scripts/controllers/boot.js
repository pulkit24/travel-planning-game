angular.module("travelPlanningGame.app")
	.controller("BootCtrl", function($scope, $window, mapStyles) {

		$scope.isReady = function() {
			return typeof google !== "undefined";
		};

		$scope.experiments = {};
		$scope.experiments.disabled = true;

		$scope.journal = {};

		$scope.mapStyles = mapStyles;
		$scope.experiments.selectedMapStyles = "retro";

		$scope.$watch("experiments.selectedMapStyles", function(newValue) {
			if(newValue) {
				$scope.experiments.customMapStyles = angular.toJson(mapStyles[$scope.experiments.selectedMapStyles]);
				window.selectedMapStyles = mapStyles[$scope.experiments.selectedMapStyles];
				$scope.$broadcast("event:map:stylesChanged");
			}
		});

		$scope.$watch("experiments.customMapStyles", function(newValue) {
			if(newValue) {
				for(var name in mapStyles) {
					if(newValue === angular.toJson(mapStyles[name])) {
						$scope.experiments.selectedMapStyles = name;
						$scope.experiments.isCustomStyleValid = true;
						return;
					}
				}
			}

			$scope.experiments.selectedMapStyles = "";
			if($scope.validate(newValue)) {
				window.selectedMapStyles = angular.fromJson(newValue);
				$scope.$broadcast("event:map:stylesChanged");
			}
		});

		$scope.experiments.isCustomStyleValid = true;
		$scope.validate = function(newStyles) {
			try {
				angular.toJson(angular.fromJson(newStyles));
				$scope.experiments.isCustomStyleValid = true;
				return true;
			} catch (e) {
				$scope.experiments.isCustomStyleValid = false;
				return false;
			}
		};

		$scope.experiments.showScreen = function(screen) {
			$scope.$broadcast("event:screen:switch", { screen: screen });
		};

		$scope.experiments.toggleDemo = function() {
			window.isDemo = !window.isDemo;
		};
		$scope.isDemo = function() { return window.isDemo; };

		angular.element(document.getElementsByTagName("body")[0]).bind("keypress", function(event) {
			// E 101
			// R 114
			// D 100
			switch(event.which) {
				case 114: // R - reload page
					window.location.reload();
					break;
				case 100: // D - toggle demo
					$scope.experiments.toggleDemo();
			}
		});

	});
