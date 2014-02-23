'use strict';

angular.module('travelPlanningGame.app')
	.directive('landmarkCard', function(timer) {
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
						return 'images/items/anz_icon_card_bg_shopping.png';
				};

				$scope.lodgingMessage = function() {
					if(timer.isEOD()) {
						return "<strong>Lodging Cost will apply.</strong><p>This is your last trip for the day. You will be lodging here tonight.</p>";
					}
					else return null;
				};
			}
			, link: function(scope, elem, attrs) {
				// if(timer.isEOD()) {
				// 	angular.element(document.getElementById("landmark-card-thumbnail-lodging")).mouseenter();
				// }
			}
		};
	});
