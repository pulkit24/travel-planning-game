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

				scope.showTransit = angular.isDefined(elem.attr("show-transit")) && String(elem.attr(
					"show-transit")).toLowerCase() !== "false";
			}
			, controller: function($scope, $q, $filter, angulargmContainer, angulargmUtils, mapGeocoder,
				mapStyles, rome2rio) {
				if (angular.isUndefined(google)) return;

				// Initialise all fixed map parameters
				$scope.map = {};
				$scope.map.zoom = 12;
				$scope.map.type = 'roadmap';
				$scope.map.bounds = new google.maps.LatLngBounds();
				$scope.map.styles = mapStyles.routeXL;

				// Change location as needed
				$scope.currentLocation = null;
				$scope.selectLocation = function(location, marker) {

					// Note the previous location for directions measurement
					// var currentLocation = $scope.ngModel;
					if (!$scope.currentLocation) {
						mapGeocoder.toCoords("Singapore")
							.then(function(coords) {
								// Add the coords into the location
								$scope.currentLocation = {};
								$scope.currentLocation.coords = angular.copy(coords);
							});
					}

					// Update the location
					$scope.ngModel = location;
					$scope.focalPoint = location; // focus on it

					// Use Rome2Rio to get the travel cost
					if ($scope.currentLocation) {
						rome2rio.search($scope.currentLocation.name, location.name,
							rome2rio.toPosition($scope.currentLocation.coords.lat, $scope.currentLocation.coords.lng), rome2rio.toPosition(
								location.coords.lat, location.coords.lng))
							.then(function(routes) {

								// Use route from Rome2Rio
								angular.forEach(routes.getPaths(), function(path, index) {
									new google.maps.Polyline({
										strokeColor: '#3ABA3A'
										, strokeOpacity: 1.0
										, strokeWeight: 5
										, map: marker.getMap()
										, path: google.maps.geometry.encoding.decodePath(path)
									});
								});

								// Fetch route from Google
								// new google.maps.DirectionsService().route({
								// 	origin: rome2rio.toPosition(currentLocation.coords.lat, currentLocation.coords.lng)
								// 	, destination: rome2rio.toPosition(location.coords.lat, location.coords.lng)
								// 	, travelMode: google.maps.TravelMode.DRIVING
								// }, function(result, status) {
								// 	if (status === google.maps.DirectionsStatus.OK) {
								// 		var x = new google.maps.DirectionsRenderer();
								// 		x.setMap(marker.getMap());
								// 		x.setDirections(result);
								// 	}
								// });
							});
					}
				};
				$scope.$watch("ngModel", function(newValue, oldValue) {
					// If being unset, record as current location internally
					if(!newValue && oldValue)
						$scope.currentLocation = oldValue;

					// Update the markers being displayed on the map
					$scope.$broadcast('gmMarkersUpdate');
				});

				// On load, modify the default Google map parameters as needed
				angulargmContainer.getMapPromise('gameMap').then(function(gmap) {
					// Request Google map to kindly use our preset parameters
					gmap.mapTypeId = $scope.map.type;
					gmap.zoom = $scope.map.zoom;
					gmap.setOptions({
						styles: $scope.map.styles
						, panControl: false
						, scaleControl: false
						, mapTypeControl: false
						, streetViewControl: false
						, overviewMapControl: false
						, zoomControlOptions: {
							style: google.maps.ZoomControlStyle.SMALL
							, position: google.maps.ControlPosition.RIGHT_CENTER
						}
					});

					// Show transit layer
					if ($scope.showTransit) {
						var transitLayer = new google.maps.TransitLayer();
						transitLayer.setMap(gmap);
					}

					// Get geo coords for all available locations
					angular.forEach($scope.availableLocations, function(location, index) {
						// Give it an id
						location.id = index;

						mapGeocoder.toCoords(location.address)
							.then(function(coords) {
								// Add the coords into the location
								location.coords = angular.copy(coords);
								$scope.map.bounds.extend(angulargmUtils.objToLatLng(coords));

								// Refresh the map once everything is done
								if (index === $scope.availableLocations.length - 1) {
									// Auto center and zoom the map
									gmap.fitBounds($scope.map.bounds);

									// Update the markers being displayed on the map
									$scope.$broadcast('gmMarkersUpdate');
								}

								$scope.showLabel(location, null, gmap);
							});
					});

					// Focus on the focal point, whenever provided
					$scope.$watch('focalPoint', function(newValue) {
						if (newValue && newValue.coords) {
							gmap.panTo(angulargmUtils.objToLatLng(newValue.coords));
						}
					});

					// // Draw the directions whenever available from
					// $scope.$watch('directions', function(newValue) {
					// 	if (newValue) {


					// 		// $scope.directions_plotted = [];

					// 		// angular.forEach(newValue, function(path, index) {
					// 		// 	this.push(
					// 		// 		new google.maps.Polyline({
					// 		// 			path: google.maps.geometry.encoding.decodePath(path)
					// 		// 			, map: gmap
					// 		// 			, clickable: false
					// 		// 			, strokeColor: '#288536'
					// 		// 			, strokeOpacity: 0.8
					// 		// 			, strokeWeight: 4
					// 		// 		})
					// 		// 	);
					// 		// }, $scope.directions_plotted);
					// 	}
					// });
				});

				// Construct an info window for the landmark label
				$scope.infoWindows = {}; // track all info windows
				$scope.showLabel = function(location, marker, map) {
					// Either of map and marker must be provided
					if (!marker && !map) {
						return false;
					}

					// Does an infowindow already exist for this location?
					var infoWindow;
					if ($scope.infoWindows[location.id]) {
						// Yes, reuse it
						infoWindow = $scope.infoWindows[location.id];
					} else {
						// No, create one
						var options = {};
						options.content = '<span style="font-weight: 700">' + location.name + '</span>';
						options.position = angulargmUtils.objToLatLng(location.coords);
						options.pixelOffset = new google.maps.Size(0, -15);

						infoWindow = new google.maps.InfoWindow(options);
						$scope.infoWindows[location.id] = infoWindow;
					}

					if (!map) {
						map = marker.getMap();
					}
					infoWindow.open(map);
					return true;
				};

				// Marker appearance
				$scope.getMarkerOptions = function(location) {

					var icon = {};
					if ($scope.ngModel && location.id === $scope.ngModel.id) {
						icon.url = '../../images/marker-orange.png';
						icon.size = new google.maps.Size(66, 66);
						icon.origin = new google.maps.Point(0, 0);
						icon.anchor = new google.maps.Point(33, 33);
					} else {
						icon.url = '../../images/marker-grey.png';
						icon.size = new google.maps.Size(30, 30);
						icon.origin = new google.maps.Point(0, 0);
						icon.anchor = new google.maps.Point(15, 15);
					}

					var options = {
						title: "Click to select " + location.name
						, icon: icon
					};

					return options;
				};
			}
		};
	});
