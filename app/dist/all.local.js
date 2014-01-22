'use strict';

angular.module('travelPlanningGame.maps', ['AngularGM', 'travelPlanningGame.templates']);

'use strict';

angular.module('travelPlanningGame.widgets', ['AngularGM', 'travelPlanningGame.templates']);

'use strict';

angular.module('travelPlanningGame.app', [
	'ngCookies', 'ngResource', 'ngSanitize', 'ngRoute', 'ui.bootstrap', 'angular-underscore',
	'angular-rome2rio', 'travelPlanningGame.maps', 'travelPlanningGame.widgets',
	'travelPlanningGame.templates'
])
	.config(function($routeProvider, rome2rioProvider) {
		$routeProvider.when('/', {
			templateUrl: 'views/game.html'
			, controller: 'GameCtrl'
		});

		// Configure the Rome2Rio API
		rome2rioProvider.setKey('uuSKZSEU');
		rome2rioProvider.setServer('free.rome2rio.com');
		rome2rioProvider.setResponseFormat('json');
		rome2rioProvider.setAPIVersion('1.2');
		rome2rioProvider.setCurrency('AUD');
		rome2rioProvider.setDetailLevel('street_address');
	})
	.run(function(landmarks) {
		landmarks.get();
	});

angular.module("travelPlanningGame.app")
	.factory("landmarks", function($http, $q, resources) {

		// Landmark file
		var source = "landmarks.json";

		// List of landmarks
		var landmarks = null;

		// Fetch landmarks
		function load() {
			var deferred = $q.defer();

			if(!landmarks) {
				$http.get(source)
				.success(function(data) {
					// Fulfill promise on success
					landmarks = data;
					angular.forEach(landmarks, function(landmark, index) {
						landmark.resources = createResourceTracker(landmark);
					});
					deferred.resolve(landmarks);
				})
				.error(function(data) {
					// Reject with failure
					deferred.reject();
				});
			} else {
				deferred.resolve(landmarks);
			}

			return deferred.promise;
		}

		// Add resource trackers to each landmark
		function createResourceTracker(landmark) {
			var resourceTracker = resources.new();

			// Landmark resources: visitingCost, lodgingCost, visitingExp, souvenirs, souvenirCost, exp
			resourceTracker.subtract(resources.categories.VISITING, resources.types.MONEY, landmark.visitingCost);
			resourceTracker.subtract(resources.categories.LODGING, resources.types.MONEY, landmark.lodgingCost);
			resourceTracker.add(resources.categories.VISITING, resources.types.XP, landmark.visitingExp);
			resourceTracker.add(resources.categories.SHOPPING, resources.types.SOUVENIR, landmark.souvenirs);
			resourceTracker.subtract(resources.categories.SHOPPING, resources.types.MONEY, landmark.souvenirCost);
			resourceTracker.add(resources.categories.ONETIME, resources.types.XP, landmark.exp);

			return resourceTracker;
		}

		return {
			get: load
		};
	});

'use strict';

angular.module('travelPlanningGame.maps')
	.factory('mapGeocoder', function($q, angulargmUtils) {
		if(angular.isUndefined(google)) return {};

		// Geocoder
		var geocoder = new google.maps.Geocoder();

		// Public functions
		var mapGeocoder = {};

		// Convert an address to geo coordinates
		// of the format: {lat, lng}
		// Returns a promise of the result
		mapGeocoder.toCoords = function(address) {
			var deferred = $q.defer();

			geocoder.geocode({
				address: address
			}, function(results) {
				deferred.resolve(angulargmUtils.latLngToObj(
					results[0].geometry.location
				));
			});

			return deferred.promise;
		};

		// Convert geo coordinates back to a human-readable address
		// Coords must be of the format: {lat, lng}
		// Returns a promise of the result
		mapGeocoder.toAddress = function(coords) {
			var deferred = $q.defer();

			geocoder.geocode({
				latLng: coords
			}, function(results) {
				deferred.resolve(results[0].formatted_address);
			});

			return deferred.promise;
		};

		return mapGeocoder;
	});

'use strict';

angular.module('travelPlanningGame.maps')
	.factory('mapStyles', function() {

		// Collection of styles used by Google maps
		var mapStyles = {};
		mapStyles.shiftWorker = [{"stylers":[{"saturation":-100},{"gamma":1}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"on"},{"saturation":50},{"gamma":0},{"hue":"#50a5d1"}]},{"featureType":"administrative.neighborhood","elementType":"labels.text.fill","stylers":[{"color":"#333333"}]},{"featureType":"road.local","elementType":"labels.text","stylers":[{"weight":0.5},{"color":"#333333"}]},{"featureType":"transit.station","elementType":"labels.icon","stylers":[{"gamma":1},{"saturation":50}]}];
		mapStyles.routeXL = [{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"on"},{"saturation":-100},{"lightness":20}]},{"featureType":"road","elementType":"all","stylers":[{"visibility":"on"},{"saturation":-100},{"lightness":40}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"on"},{"saturation":-10},{"lightness":30}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"simplified"},{"saturation":-60},{"lightness":10}]},{"featureType":"landscape.natural","elementType":"all","stylers":[{"visibility":"simplified"},{"saturation":-60},{"lightness":60}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"},{"saturation":-100},{"lightness":60}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"},{"saturation":-100},{"lightness":60}]}];
		mapStyles.paleDawn = [{"featureType":"water","stylers":[{"visibility":"on"},{"color":"#acbcc9"}]},{"featureType":"landscape","stylers":[{"color":"#f2e5d4"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#c5c6c6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#e4d7c6"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#fbfaf7"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#c5dac6"}]},{"featureType":"administrative","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"road"},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{},{"featureType":"road","stylers":[{"lightness":20}]}];
		mapStyles.oldTimey = [{"featureType":"administrative","stylers":[{"visibility":"off"}]},{"featureType":"poi","stylers":[{"visibility":"simplified"}]},{"featureType":"road","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"simplified"}]},{"featureType":"transit","stylers":[{"visibility":"simplified"}]},{"featureType":"landscape","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"visibility":"off"}]},{"featureType":"road.local","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"color":"#84afa3"},{"lightness":52}]},{"stylers":[{"saturation":-77}]},{"featureType":"road"}];
		mapStyles.midnight = [{"featureType":"water","stylers":[{"color":"#021019"}]},{"featureType":"landscape","stylers":[{"color":"#08304b"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#000000"},{"lightness":13}]},{"featureType":"transit","stylers":[{"color":"#146474"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]}];

		return mapStyles;
	});

angular.module("travelPlanningGame.app")
	.factory("resources", function() {

		// Resource types
		var types = {};
		types.ALL = 10;
		types.MONEY = 11;
		types.XP = 12;
		types.SOUVENIR = 13;

		// Test conditions for updating these types
		var updateTests = {};
		// Money after update must not go negative
		updateTests.MONEY = function(original, delta) {
			return original + delta >= 0;
		};
		// XP cannot go negative
		updateTests.XP = function(original, delta) {
			return original + delta >= 0;
		};
		// Souvenirs cannot go negative
		updateTests.SOUVENIR = function(original, delta) {
			return original + delta >= 0;
		};

		// Categories of events representing possible resource applications
		var categories = {};
		categories.ALL = 99;
		categories.VISITING = 98; // example, visiting cost
		categories.LODGING = 97;
		categories.SHOPPING = 96; // example, shopping gains
		categories.DISCOVERY = 95; // i.e. one-time events
		// add other categories dynamically as needed

		// Track resources for the caller
		var Resources = function() {
			// Get the value of a resource
			// Safer alternative to manually access the object properties
			this.get = function getResource(category, type) {
				if (this[category] && this[category][type])
					return this[category][type];
				else
					return 0;
			};

			// Ability to update the value of any resource
			this.update = function updateResource(category, type, amount) {
				// Create if no prevalent track
				if (!this[category])
					this[category] = {};
				if (!this[category][type])
					this[category][type] = 0;

				// Test whether the update is possible
				if (!updateTests[type] || updateTests[type](this[category][type], amount))
					this[category][type] += amount;

				return this;
			};
			// Convenience functions for adding and subtracting amounts
			this.add = this.update;
			this.subtract = function subtractResource(category, type, amount) {
				return this.update(category, type, -1 * amount);
			};
		};

		// Create a new Resource tracker
		function startTracker() {
			return new Resources();
		}

		// Check whether updating source Resources by destination Resources is possible
		function canDelta(sourceResources, sourceCategory, destinationResources, destinationCategory) {
			var possible = true;
			angular.forEach(destinationResources[destinationCategory], function(amount, type) {
				if (updateTests[type] && !updateTests[type](sourceResources[sourceCategory][type], amount))
					possible = false;
			});
			return possible;
		}

		// Update source Resources by destination Resources on supplied categories only
		function delta(sourceResources, sourceCategory, destinationResources, destinationCategory) {
			if (canDelta) {
				angular.forEach(destinationResources[destinationCategory], function(amount, type) {
					sourceResources.update(sourceCategory, type, amount);
				});
			}
		}

		return {
			new: startTracker
			, canDelta: canDelta
			, delta: delta
			, types: types
			, categories: categories
		};
	});

angular.module("travelPlanningGame.app")
	.factory("timer", function() {

		// Times of a day
		var times = ["morning", "afternoon", "evening", "night"];
		// Utility to get the display name by number
		function toTimeOfDay(time) {
			return times[time] ? times[time] : null;
		}

		// Limits on days and times
		var limits = {};
		limits.days = 1;
		limits.times = 1; // number of "times of day" currently used by the game
		// Set the day limits and times of day to use
		function setLimits(lastDay, lastTimeOfDay) {
			limits.days = (lastDay >= 1) ? lastDay : 1;

			limits.times = (lastTimeOfDay >= 1) ? (
				(lastTimeOfDay <= times.length) ? lastTimeOfDay : times.length
			) : 1;
		}
		// Get the limits - for the curious
		function getLimits() {
			return limits;
		}

		// Current time
		var current = null;
		var Time = function(day, time) {
			this.day = day;
			this.time = time;
		};
		// Get the time
		function getCurrent() {
			return current;
		}
		// Convert to timestamp
		function getTimestamp(time) {
			if (!time)
				time = current;

			return time.day + "." + time.time;
		}
		// Unmarshal a timestamp
		function fromTimestamp(timestamp) {
			var parts = timestamp.split(".");
			return new Time(parts[0], parts[1]);
		}

		// Start timer at (1, 1)
		function start() {
			current = new Time(1, 1);
			return true;
		}

		// Move to the next timeslot
		function next() {
			if (isLast())
				return false;

			var nextDay = _isEOD() ? (current.day + 1) : current.day;
			var nextTime = _isEOD() ? 1 : (current.time + 1);

			current = new Time(nextDay, nextTime);
			return true;
		}

		function _isEOD() {
			return current.time === limits.times;
		}

		function _isLastDay() {
			return current.day === limits.days;
		}

		function isLast() {
			return _isLastDay() && _isEOD();
		}

		return {
			config: setLimits
			, getLimits: getLimits
			, start: start
			, next: next
			, isLast: isLast
			, now: getCurrent
			, toTimestamp: getTimestamp
			, fromTimestamp: fromTimestamp
			, toTimeOfDay: toTimeOfDay
		};
	});

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
		};
	});

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
				if(angular.isUndefined(google)) return;

				// Initialise all fixed map parameters
				$scope.map = {};
				$scope.map.zoom = 12;
				$scope.map.type = 'roadmap';
				$scope.map.bounds = new google.maps.LatLngBounds();
				$scope.map.styles = mapStyles.routeXL;

				// Change location as needed
				$scope.selectLocation = function(location, marker) {

					// Note the previous location for directions measurement
					var previousLocation = $scope.ngModel;

					// Update the location
					$scope.ngModel = location;
					$scope.focalPoint = location; // focus on it

					// Use Rome2Rio to get the travel cost
					if (previousLocation) {
						rome2rio.search(previousLocation.name, location.name,
							rome2rio.toPosition(previousLocation.coords.lat, previousLocation.coords.lng), rome2rio.toPosition(
								location.coords.lat, location.coords.lng))
							.then(function(routes) {


								new google.maps.DirectionsService().route({
									origin: rome2rio.toPosition(previousLocation.coords.lat, previousLocation.coords.lng)
									, destination: rome2rio.toPosition(location.coords.lat, location.coords.lng)
									, travelMode: google.maps.TravelMode.DRIVING
								}, function(result, status) {
									if (status == google.maps.DirectionsStatus.OK) {
										var x = new google.maps.DirectionsRenderer();
										x.setMap(marker.getMap());
										x.setDirections(result);
									}
								});




							});
					}
				};
				$scope.$watch("ngModel", function() {
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

'use strict';

angular.module('travelPlanningGame.widgets')
	.directive('widgetResourceIndicator', function() {
		return {
			restrict: 'EA'
			, templateUrl: 'templates/widgets.resource-indicator.tpl.html'
			, scope: {
				resources: '='
				, type: '@'
				, category: "@"
			}
			, link: function(scope, elem, attrs) {
				scope.icon = scope.type === 'MONEY' ? 'dollar' : (scope.type === 'XP' ? 'star' :
					'shopping-cart');
			}
			, controller: function($scope, $filter, resources) {
				$scope.getValue = function() {
					return $filter("number")($scope.resources.get(resources.categories[$scope.category],
						resources.types[$scope.type]));
				};
			}
		};
	})
	.directive('widgetDayCounter', function() {
		return {
			restrict: 'EA'
			, templateUrl: 'templates/widgets.day-counter.tpl.html'
			, scope: {}
			, controller: function($scope, timer) {
				$scope.now = timer.now();
				$scope.limits = timer.getLimits();
			}
		};
	});

angular.module("travelPlanningGame.app")
	.controller("BootCtrl", function($scope) {
			$scope.isReady = function() {
				return angular.isDefined(google));
		};
});

angular.module("travelPlanningGame.app")
	.controller('GameCtrl', function($scope, timer, landmarks, resources) {

		/////////////////////////
		// Current game state //
		/////////////////////////
		$scope.current = {};

		//////////////////
		// Game states //
		//////////////////
		var states = ["menu", "playing", "stats"]; // available states

		// Current status
		$scope.current.state = states[0];

		///////////////////////////
		// Game master controls //
		///////////////////////////
		$scope.game = {};
		$scope.game.start = function() {
			// Start the game
			$scope.current.state = "playing";

			// Create a resource tracker
			var resourceTracker = resources.new();
			resourceTracker.add(resources.categories.ALL, resources.types.MONEY, $scope.settings.budget);
			$scope.resources = resourceTracker;

			// Start the timer
			timer.config($scope.settings.travelDays, 3);
			timer.start();
		};
		$scope.game.end = function() {
			// End the game
			$scope.current.state = "stats";
		};
		$scope.game.menu = function() {
			// Back to the menu
			$scope.current.state = "menu";
		};

		/////////////////
		// Game turns //
		/////////////////
		// Check conditions for eligibility for another round
		$scope.game.canPlay = function(giveReason) {
			// Landmark selected?
			if (!$scope.locations.selected)
				return giveReason ? 'Select a landmark to visit.' : false;

			// Everything is permitted in sandbox mode (once a landmark is selected)
			if ($scope.settings.sandboxMode)
				return giveReason ? null : true;

			// Days left?
			if (timer.isLast())
				return giveReason ? 'Your trip is over.' : false;

			// Funds left?
			if (!resources.canDelta(resources, resources.categories.ALL, $scope.locations.selected.resources,
				resources.categories.VISITING))
				return giveReason ? 'Not enough funds for visiting this landmark.' : false;

			return giveReason ? null : true;
		};
		$scope.game.startTurn = function() {
			// Start this turn
			// Set the selected landmark as the current location
			$scope.current.location = $scope.locations.selected;

			// Charge for visiting costs and such
			resources.delta($scope.resources, resources.categories.ALL, $scope.current.location.resources,
				resources.categories.VISITING);

			// open the side bar
			$scope.isInTurn = true;
		};
		$scope.game.canShop = function(giveReason) {
			// Funds left?
			if (!resources.canDelta(resources, resources.categories.ALL, $scope.current.location.resources,
				resources.categories.SHOPPING))
				return giveReason ? 'Not enough funds for shopping today.' : false;

			return giveReason ? null : true;
		};
		$scope.game.shop = function() {
			// Charge for shopping
			resources.delta($scope.resources, resources.categories.ALL, $scope.current.location.resources,
				resources.category.SHOPPING);
		};
		$scope.game.endTurn = function() {
			// Next turn this day
		};

		// Generic function to execute a "canI ?" function to supply a reason instead of just true/false
		$scope.whyCantI = function(task) {
			return task(true);
		};

		///////////////
		// Locations //
		///////////////
		$scope.locations = {};
		$scope.locations.cities = ["Singapore"]; // cities
		$scope.locations.landmarks = null; // landmarks
		landmarks.get().then(function(data) {
			$scope.locations.landmarks = data;
		});
		$scope.locations.selected = null; // selected landmark for whatever reason

		// Current status
		$scope.current.location = null;
		$scope.current.city = $scope.locations.cities[0];

		/////////////////////
		// Game settings //
		/////////////////////
		$scope.settings = {};
		$scope.settings.budget = 1000;
		$scope.settings.travelDays = 4;

	});

angular.module('travelPlanningGame.templates', ['templates/landmark-card.tpl.html', 'templates/maps.game.tpl.html', 'templates/widgets.day-counter.tpl.html', 'templates/widgets.resource-indicator.tpl.html']);

angular.module('templates/landmark-card.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/landmark-card.tpl.html',
    '<!-- Landmark card -->\n' +
    '<div class="landmark-card" ng-class="{flipped : isFlipped}">\n' +
    '\n' +
    '	<!-- Front face -->\n' +
    '	<div class="panel panel-primary landmark-card-face landmark-card-face-front">\n' +
    '\n' +
    '		<!-- Landmark name and controls -->\n' +
    '		<div class="panel-header panel-heading">\n' +
    '\n' +
    '			<!-- Controls -->\n' +
    '			<i class="fa close fa-times fa-fw" ng-click="landmark = null"></i>\n' +
    '			<i class="fa close fa-rotate-left fa-fw" ng-click="isFlipped = !isFlipped"></i>\n' +
    '\n' +
    '			<h3>{{ landmark.name }}</h3>\n' +
    '		</div>\n' +
    '		<!-- end name and controls -->\n' +
    '\n' +
    '		<!-- Image and quick stats -->\n' +
    '		<div class="panel-body" ng-style="{\'background-image\': \'url(\' + landmark.image + \')\'}">\n' +
    '			<div class="col-xs-offset-9">\n' +
    '				<div class="thumbnail resource text-center">\n' +
    '					<small>LODGING</small>\n' +
    '					<h3>{{ landmark.lodgingCost }} <i class="fa fa-dollar"></i>\n' +
    '					</h3>\n' +
    '					<small>PER DAY</small>\n' +
    '				</div>\n' +
    '				<div class="thumbnail resource text-center">\n' +
    '					<small>VISITING</small>\n' +
    '					<h3>{{ landmark.visitingCost }} <i class="fa fa-dollar"></i>\n' +
    '					</h3>\n' +
    '					+{{ landmark.visitingExp }} <i class="fa fa-star"></i>\n' +
    '				</div>\n' +
    '				<div class="thumbnail resource text-center">\n' +
    '					<h3>{{ landmark.souvenirs }} <i class="fa fa-shopping-cart"></i>\n' +
    '					</h3>\n' +
    '					<small>FOR {{ landmark.souvenirCost }} <i class="fa fa-dollar"></i>\n' +
    '					</small>\n' +
    '				</div>\n' +
    '			</div>\n' +
    '		</div>\n' +
    '		<!-- end image and stats -->\n' +
    '\n' +
    '		<!-- Features, flavour text and options -->\n' +
    '		<ul class="list-group">\n' +
    '			<li class="list-group-item list-item" ng-repeat="bonus in landmark.bonuses">\n' +
    '				<span class="pull-right text-primary" ng-show="bonus.type">{{ bonus.type | uppercase }}</span>\n' +
    '				<i class="fa" ng-class="bonus.icon"></i> {{ bonus.flavour }}\n' +
    '				<em class="text-muted" ng-show="bonus.implication">\n' +
    '					<small>({{ bonus.implication }})</small>\n' +
    '				</em>\n' +
    '			</li>\n' +
    '		</ul>\n' +
    '		<!-- end features -->\n' +
    '\n' +
    '		<!-- One time bonus -->\n' +
    '		<div class="panel-footer text-center">\n' +
    '			One-time visiting bonus:\n' +
    '			<strong>+{{ landmark.exp }} <i class="fa fa-star"></i>\n' +
    '			</strong>\n' +
    '		</div>\n' +
    '		<!-- end bonus -->\n' +
    '\n' +
    '	</div>\n' +
    '	<!-- end front face -->\n' +
    '\n' +
    '	<!-- Back face -->\n' +
    '	<div class="panel panel-primary landmark-card-face landmark-card-face-back">\n' +
    '\n' +
    '		<!-- Landmark name and controls -->\n' +
    '		<div class="panel-header panel-heading">\n' +
    '\n' +
    '			<!-- Controls -->\n' +
    '			<i class="fa close fa-times fa-fw" ng-click="landmark = null"></i>\n' +
    '			<i class="fa close fa-rotate-left fa-fw" ng-click="isFlipped = !isFlipped"></i>\n' +
    '\n' +
    '			<h3>{{ landmark.name }}</h3>\n' +
    '		</div>\n' +
    '		<!-- end name and controls -->\n' +
    '\n' +
    '		<!-- Image -->\n' +
    '		<div class="panel-body" ng-style="{\'background-image\': \'url(\' + landmark.image + \')\'}">\n' +
    '			<div class="col-xs-offset-9 invisible">\n' +
    '				<div class="thumbnail resource text-center">\n' +
    '					<small>LODGING</small>\n' +
    '					<h3>{{ landmark.lodgingCost }} <i class="fa fa-dollar"></i>\n' +
    '					</h3>\n' +
    '					<small>PER DAY</small>\n' +
    '				</div>\n' +
    '				<div class="thumbnail resource text-center">\n' +
    '					<small>VISITING</small>\n' +
    '					<h3>{{ landmark.visitingCost }} <i class="fa fa-dollar"></i>\n' +
    '					</h3>\n' +
    '					+{{ landmark.visitingExp }} <i class="fa fa-star"></i>\n' +
    '				</div>\n' +
    '				<div class="thumbnail resource text-center">\n' +
    '					<h3>{{ landmark.souvenirs }} <i class="fa fa-shopping-cart"></i>\n' +
    '					</h3>\n' +
    '					<small>FOR {{ landmark.souvenirCost }} <i class="fa fa-dollar"></i>\n' +
    '					</small>\n' +
    '				</div>\n' +
    '			</div>\n' +
    '		</div>\n' +
    '		<!-- end image -->\n' +
    '\n' +
    '		<!-- Features, flavour text and options -->\n' +
    '		<ul class="list-group">\n' +
    '			<li class="list-group-item list-item">{{ landmark.description }}</li>\n' +
    '		</ul>\n' +
    '		<!-- end features -->\n' +
    '\n' +
    '		<!-- One time bonus -->\n' +
    '		<div class="panel-footer text-center">\n' +
    '			<div class="invisible">\n' +
    '				One-time visiting bonus:\n' +
    '				<strong>+{{ landmark.exp }} <i class="fa fa-star"></i>\n' +
    '				</strong>\n' +
    '			</div>\n' +
    '		</div>\n' +
    '		<!-- end bonus -->\n' +
    '\n' +
    '	</div>\n' +
    '	<!-- end back face -->\n' +
    '\n' +
    '</div>\n' +
    '<!-- end card -->\n' +
    '');
}]);

angular.module('templates/maps.game.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/maps.game.tpl.html',
    '<div gm-map\n' +
    '	ng-if="isEnabled()"\n' +
    '	class="map-canvas"\n' +
    '	gm-map-id="\'gameMap\'"\n' +
    '	gm-center="center"\n' +
    '	gm-zoom="zoom"\n' +
    '	gm-bounds="bounds"\n' +
    '	gm-map-type-id="type">\n' +
    '	<div gm-markers\n' +
    '		gm-objects="availableLocations"\n' +
    '		gm-id="object.id"\n' +
    '		gm-marker-options="getMarkerOptions(object)"\n' +
    '		gm-position="{lat: object.coords.lat, lng: object.coords.lng}"\n' +
    '		gm-on-click="selectLocation(object, marker); showLabel(object, marker)">\n' +
    '	</div>\n' +
    '	<div id="map-infoWindow-markerLabel-sample">\n' +
    '		<div class="well">\n' +
    '			<strong>{{ location.name }}</strong>\n' +
    '		</div>\n' +
    '	</div>\n' +
    '</div>');
}]);

angular.module('templates/widgets.day-counter.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/widgets.day-counter.tpl.html',
    '<div class="widget-day-counter">\n' +
    '	<h1>Day</h1>\n' +
    '	<h1>{{ now.day | number }}<small>/ {{ limits.days }}</h1>\n' +
    '</div>\n' +
    '');
}]);

angular.module('templates/widgets.resource-indicator.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/widgets.resource-indicator.tpl.html',
    '<div class="widget-resource-indicator" ng-class="\'widget-resource-indicator-\' + type">\n' +
    '	<i class="widget-resource-indicator-icon fa fa-fw fa-3x" ng-class="\'fa-\' + icon"></i>\n' +
    '	<span class="widget-resource-indicator-value" ng-bind="getValue()"></span>\n' +
    '</div>\n' +
    '');
}]);
