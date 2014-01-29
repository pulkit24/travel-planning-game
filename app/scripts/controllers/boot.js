angular.module("travelPlanningGame.app")
	.controller("BootCtrl", function($scope, mapStyles) {
		$scope.isReady = function() {
			return angular.isDefined(google);
		};

		$scope.mapStyles = mapStyles;
		$scope.selectedMapStyles = "Kevin's Styles";

		$scope.$watch("selectedMapStyles", function(newValue) {
			if(newValue) {
				$scope.customMapStyles = angular.toJson(mapStyles[$scope.selectedMapStyles]);
				window.selectedMapStyles = mapStyles[$scope.selectedMapStyles];
				$scope.$broadcast("event:map:stylesChanged");
			}
		});

		$scope.$watch("customMapStyles", function(newValue) {
			if(newValue) {
				for(var name in mapStyles) {
					if(newValue === angular.toJson(mapStyles[name])) {
						$scope.selectedMapStyles = name;
						$scope.isCustomStyleValid = true;
						return;
					}
				}
			}

			$scope.selectedMapStyles = "";
			if($scope.validate(newValue)) {
				window.selectedMapStyles = angular.fromJson(newValue);
				$scope.$broadcast("event:map:stylesChanged");
			}
		});

		$scope.isCustomStyleValid = true;
		$scope.validate = function(newStyles) {
			try {
				angular.toJson(angular.fromJson(newStyles));
				$scope.isCustomStyleValid = true;
				return true;
			} catch (e) {
				$scope.isCustomStyleValid = false;
				return false;
			}
		};

	});
