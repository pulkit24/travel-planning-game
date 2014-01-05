'use strict';

angular.module('travelPlanningGame.maps')
	.directive('locationPreviewMap', function() {
		return {
			templateUrl: '../../templates/maps.locationpreview.tpl.html'
			, restrict: 'EA'
			, scope: {
				selectedLocation: '='
				, availableLocations: '='
			}
			, link: function(scope, elem, attrs) {
				// Proceed only if this map is enabled (helps prevent unncessary Google API calls during development)
				scope.isEnabled = function() {
					return !elem.attr('disabled');
				};
			}
			, controller: function($scope, $q, angulargmContainer, angulargmUtils, mapGeocoder) {
				// Initialise all fixed map parameters
				$scope.zoom = 2;
				$scope.type = 'roadmap';

				// Change location as needed
				$scope.selectLocation = function(location, marker) {
					$scope.selectedLocation = location.id;
				};

				// On load, modify the default Google map parameters as needed
				angulargmContainer.getMapPromise('locationPreviewMap').then(function(gmap) {
					// Request Google map to kindly use our preset parameters
					gmap.mapTypeId = $scope.type;
					gmap.zoom = $scope.zoom;

					// Get geo coords for all available locations
					angular.forEach($scope.availableLocations, function(location, index) {
						// Give it an id
						location.id = index;

						mapGeocoder.toCoords(location.country + ', ' + location.city)
							.then(function(coords) {
								// Add the coords into the location
								location.coords = angular.copy(coords);

								// Pan to the default (initial) location
								if(index === $scope.selectedLocation) {
									gmap.setCenter(coords);
								}

								// Update the markers being displayed on the map
								$scope.$broadcast('gmMarkersUpdate');
							});
					});
				});
			}
		};
	});
