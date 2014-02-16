'use strict';

angular.module('travelPlanningGame.maps')
	.directive('gameMap', function() {
		return {
			templateUrl: 'templates/maps.game.tpl.html'
			, restrict: 'EA'
			, scope: {
				config: "&options"
				, current: "="
				, selected: "="
			}
			, controller: function($scope, $q, $timeout, angulargmContainer, angulargmUtils, mapStyles, mapRouter,
				mapGeocoder, stateTracker, resources) {

				// On load, see if the map data is ready
				$scope.mapState = stateTracker.get("mapState");
				$scope.mapState.$on("updated", function() {
					$scope.mapState.load();
					loadMap();
					$scope.mapState.ready();
				});

				// As soon as Google maps is ready, grab a handle
				angulargmContainer.getMapPromise('gameMap').then(function(gmap) {
					$scope.map = gmap;
				});

				function loadMap() {
					$scope.clearLabels();

					// Request Google map to kindly use our preset parameters
					setMapParameters();

					// Get geo coords for all available locations
					angular.forEach($scope.locations, function(location, index) {
						// Give it an id
						location.id = index;

						plotLocation(location).then(function() {
							$scope.focus();

							// Refresh the markers being displayed on the map
							$scope.$broadcast('gmMarkersRedraw');

							// If last, mark geocoding as complete
							if (index === $scope.locations.length - 1)
								stateTracker.new("geocodingState").complete();
						});
					});

					// When geocoding is complete, prefetch all routes
					stateTracker.new("geocodingState").$on("complete", function() {
						stateTracker.new("geocodingState").reset();
						mapRouter.prefetch($scope.locations);
					});
				}

				// When the map is ready, apply the params and updates
				function setMapParameters() {
					// Initialise all map parameters
					angular.extend($scope, $scope.config());

					$scope.disabled = $scope.disabled || angular.isUndefined(google);
					$scope.type = 'roadmap';
					$scope.bounds = new google.maps.LatLngBounds();
					$scope.styles = window.selectedMapStyles;

					$scope.$on("event:map:stylesChanged", function() {
						$scope.map.setOptions({
							styles: window.selectedMapStyles
						});
					});

					// Request Google map to kindly use our preset parameters
					$scope.map.setOptions({
						styles: $scope.styles
						, mapTypeId: $scope.type
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
						transitLayer.setMap($scope.map);
					}
				}

				// Plot location markers on the map
				function plotLocation(location) {
					var deferred = $q.defer();

					mapGeocoder.toCoords(location.address)
						.then(
							function success(coords) {
								// Add the coords into the location
								location.coords = angular.copy(coords);
								$scope.bounds.extend(angulargmUtils.objToLatLng(coords));

								// Show landmark label
								$scope.showLabel(location, null, $scope.map);

								deferred.resolve();
							}
							, function error() {
								deferred.resolve();
							}
						);

					return deferred.promise;
				}

				// Focus on the focusable location - either selected or current
				// based on the initial config
				$scope.focus = function() {
					$timeout(function() {

						var focalPoint = null;

						if ($scope.focusOn === "selected" || ($scope.focusOn === "auto" && $scope.selected))
							focalPoint = $scope.selected;
						else if ($scope.focusOn === "current" || ($scope.focusOn === "auto" && !$scope.selected))
							focalPoint = $scope.current;

						if (focalPoint && focalPoint.coords) {
							$scope.map.panTo(angulargmUtils.objToLatLng({
								lat: focalPoint.coords.lat
								, lng: focalPoint.coords.lng - 0.02
							}));
						} else {
							// Auto center and zoom the map
							$scope.map.fitBounds($scope.bounds);
						}

						// If zoom is not set to auto
						if($scope.zoom !== "auto")
							$scope.map.setZoom($scope.zoom); // the only way the map respects us
					}, 0);
				};

				// Select a point on the map (other than a marker/location)
				$scope.selectPoint = function(map, event) {
					if ($scope.selectable !== "point" && $scope.selectable !== "all") return;

					var point = {
						id: 'startingPoint'
						, name: 'I start from here!'
						, coords: event.latLng ? angulargmUtils.latLngToObj(event.latLng) : event.coords
						, description: 'This is where you started your journey from. This could be your starting hotel. Return here whenever you wish to.'
						// , image: "images/landmarks/casino_sentosa.jpg"
						, lodgingCost: 0
						, visitingCost: 0
						, visitingExp: 0
						, shopping: {
							name: ''
							, description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.'
							// , image: images/items/anz_icon_singapore_sling.png
							, souvenirs: 0
							, cost: 0
						}
						, exp: 0
					};
					point.resources = resources.new();
					// Typical landmark resources: visitingCost, lodgingCost, visitingExp, souvenirs, souvenirCost, exp
					point.resources.set(resources.categories.VISITING, resources.types.MONEY, 0);
					point.resources.set(resources.categories.LODGING, resources.types.MONEY, 0);
					point.resources.set(resources.categories.VISITING, resources.types.XP, 0);
					point.resources.set(resources.categories.SHOPPING, resources.types.SOUVENIR, 0);
					point.resources.set(resources.categories.SHOPPING, resources.types.MONEY, 0);
					point.resources.set(resources.categories.DISCOVERY, resources.types.XP, 0);

					// Create a single-member collection of points for this selected starting point
					$scope.points = [point];

					// Mark as selected
					$scope.selected = point;
					$scope.focus(); // focus if needed

					// Show label
					$scope.showLabel(point, null, $scope.map);

					// Update the markers being displayed on the map
					// Note: because this is a new point selected on the map
					// that erases any previously-selected point, we need
					// to force redraw instead of just a notify update (which does a shallow object match)
					$scope.$broadcast('gmMarkersRedraw');
				};

				// Change location as needed
				$scope.selectLocation = function(location, marker) {
					if ($scope.selectable !== "location" && $scope.selectable !== "all") return;

					// If "all" are selectable, then to ensure uniqueness
					// we must manually erase any stray points on the map
					if($scope.selectable === "all") {
						$timeout(function() {
							$scope.points = [];
							$scope.clearLabel('startingPoint');
						}, 0);
					}

					// Update the location
					$scope.selected = location;
					$scope.focus(); // focus if needed

					// Draw route and set the transport cost
					if($scope.current) {
						mapRouter.fetch($scope.current, $scope.selected).then(function(route) {

							// Draw
							mapRouter.draw(route, $scope.map);

							// Set cost
							if($scope.selected.resources)
								$scope.selected.resources.set(resources.categories.TRANSPORT, resources.types.MONEY, -1 * route.cost);
						});
					}

					// Show label
					$scope.showLabel(location, null, $scope.map);

					// Update the markers being displayed on the map
					$scope.$broadcast('gmMarkersUpdate');
				};

				// Construct an info window for the landmark label
				$scope.infoWindows = {}; // track all info windows
				$scope.clearLabels = function() {
					angular.forEach($scope.infoWindows, function(infoWindow, locationID) {
						infoWindow.close();
					});
				};
				$scope.clearLabel = function(labelLocationID) {
					angular.forEach($scope.infoWindows, function(infoWindow, locationID) {
						if(labelLocationID === locationID)
							infoWindow.close();
					});
				};
				$scope.showLabel = function(location, marker, map) {
					// Either of map and marker must be provided
					if (!marker && !map) {
						return false;
					}

					// Does an infowindow already exist for this location?
					var infoWindow;
					if ($scope.infoWindows[location.id]) {
						// Yes, destroy it
						$scope.infoWindows[location.id].close();
					}

					// Now, create one
					var options = {};
					options.content = '<span style="font-weight: 700">' + location.name + '</span>';
					options.position = angulargmUtils.objToLatLng(location.coords);
					options.pixelOffset = new google.maps.Size(0, -15);

					infoWindow = new google.maps.InfoWindow(options);
					$scope.infoWindows[location.id] = infoWindow;

					if (!map) {
						map = marker.getMap();
					}
					infoWindow.open(map);
					return true;
				};

				// Marker appearance
				$scope.getMarkerOptions = function(location) {

					// Standard marker
					var defaultMarker = {
						url: 'images/markers/marker-grey.png'
						, size: new google.maps.Size(30, 30)
						, origin: new google.maps.Point(0, 0)
						, anchor: new google.maps.Point(15, 15)
					};

					// Selected location marker
					var selectedMarker = {
						url: 'images/markers/marker-orange.png'
						, size: new google.maps.Size(66, 66)
						, origin: new google.maps.Point(0, 0)
						, anchor: new google.maps.Point(33, 33)
					};

					// Current location marker
					var currentMarker = {
						url: 'images/markers/marker-green.png'
						, size: new google.maps.Size(104, 104)
						, origin: new google.maps.Point(0, 0)
						, anchor: new google.maps.Point(52, 52)
					};

					// Pick a marker based on the location
					var icon = null;
					if ($scope.current && $scope.current.id === location.id)
						icon = currentMarker;
					else if ($scope.selected && $scope.selected.id === location.id)
						icon = selectedMarker;
					else
						icon = defaultMarker;

					var options = {
						title: "Click to select " + location.name
						, icon: icon
					};

					return options;
				};


			}
		};
	});
