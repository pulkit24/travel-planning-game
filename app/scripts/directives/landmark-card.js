'use strict';

angular.module('travelPlanningGame.app')
	.directive('landmarkCard', function() {
		return {
			restrict: 'EA'
			, transclude: true
			, scope: {
				landmark: '='
			}
			, templateUrl: 'templates/landmark-card.tpl.html'
			, controller: function($scope, $timeout, history, stateTracker) {

				$scope.isVisited = function() {
					return history.getInstance("landmarks").find($scope.landmark.id) !== null;
				};

				$scope.getLandmarkImage = function() {
					if($scope.landmark && $scope.isVisited())
						return $scope.landmark.image;
					else
						return $scope.landmark.imageDefault;
				};

				$scope.getSouvenirImage = function() {
					if($scope.landmark && $scope.isVisited())
						return $scope.landmark.shopping.image;
					else
						return 'app/images/landmarks/anz_icon_card_bg_shopping.png';
				};
			}
		};
	});
