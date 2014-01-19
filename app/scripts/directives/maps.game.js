'use strict';

angular.module('travelPlanningGame.maps')
	.directive('gameMap', function() {
		return {
			templateUrl: 'templates/maps.game.tpl.html'
			, restrict: 'EA'
			, scope: {
				focalPoint: '='
				, ngModel: '='
				, availableLocations: '='
			}
			, link: function(scope, elem, attrs) {
				// Proceed only if this map is enabled (helps prevent unncessary Google API calls during development)
				scope.isEnabled = function() {
					return !elem.attr('disabled');
				};
			}
			, controller: function($scope, $q, $filter, angulargmContainer, angulargmUtils, mapGeocoder, mapStyles) {
				// Initialise all fixed map parameters
				$scope.zoom = 12;
				$scope.type = 'roadmap';
				$scope.bounds = new google.maps.LatLngBounds();

				$scope.styles = mapStyles.routeXL;

				// Change location as needed
				$scope.selectLocation = function(location, marker) {
					$scope.ngModel = location;
				};

				// On load, modify the default Google map parameters as needed
				angulargmContainer.getMapPromise('gameMap').then(function(gmap) {
					// Request Google map to kindly use our preset parameters
					gmap.mapTypeId = $scope.type;
					gmap.zoom = $scope.zoom;
					gmap.setOptions({
						styles: $scope.styles
					});

					// Show transit layer
					var transitLayer = new google.maps.TransitLayer();
					transitLayer.setMap(gmap);

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

								$scope.showLabel(location, null, gmap);
							});
					});

					// Focus on the focal point, whenever provided
					$scope.$watch('focalPoint', function(newValue) {
						if (newValue && newValue.lat && newValue.lng) {
							gmap.panTo(angulargmUtils.objToLatLng(newValue));
						}
					});
				});

				// Construct an info window for the landmark label
				$scope.showLabel = function(location, marker, map) {
					// Either of map and marker must be provided
					if(!marker && !map) {
						return false;
					}

					var options = {};
					options.content = '<span style="font-weight: 700">' + location.name + '</span>';
					options.position = angulargmUtils.objToLatLng(location.coords);
					options.pixelOffset = new google.maps.Size(0, -30);

					var infoWindow = new google.maps.InfoWindow(options);

					if(!map) {
						map = marker.getMap();
					}

					infoWindow.open(map);
					return true;
				};

				// Marker appearance
				$scope.getMarkerOptions = function(location) {
					var options = {
						title: "Click to select " + location.name
						, icon: (
							location === $scope.ngModel ? '../../images/marker-green.png' :
							(location.isOnHover ? '../../images/marker-orange.png' : '../../images/marker-grey.png')
						)
					};

					return options;
				};
			}
		};
	});
