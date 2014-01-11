'use strict';

angular.module('travelPlanningGame.maps')
	.directive('gameMap', function() {
		return {
			templateUrl: 'templates/maps.game.tpl.html'
			, restrict: 'EA'
			, scope: {
				initialLocation: '='
				, selectedLocation: '='
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
				$scope.zoom = 12;
				$scope.type = 'roadmap';
				$scope.bounds = new google.maps.LatLngBounds();

				// Change location as needed
				$scope.selectLocation = function(location, marker) {
					$scope.selectedLocation = location;
				};

				// On load, modify the default Google map parameters as needed
				angulargmContainer.getMapPromise('gameMap').then(function(gmap) {
					// Request Google map to kindly use our preset parameters
					gmap.mapTypeId = $scope.type;
					gmap.zoom = $scope.zoom;

					// Get geo coords for all available locations
					angular.forEach($scope.availableLocations, function(location, index) {
						// Give it an id
						location.id = index;

						mapGeocoder.toCoords(location.address)
							.then(function(coords) {
								// Add the coords into the location
								location.coords = angular.copy(coords);
								$scope.bounds.extend(angulargmUtils.objToLatLng(coords));

								// Refresh the map once everything is done
								if (index === $scope.availableLocations.length - 1) {
									// Auto center and zoom the map
									gmap.fitBounds($scope.bounds);

									// Update the markers being displayed on the map
									$scope.$broadcast('gmMarkersUpdate');
								}
							});
					});
				});
			}
		};
	});
