angular.module("travelPlanningGame.app")
	.controller('GameCtrl', function($scope, $timeout, $q, timer, locations, resources, history,
		randomEvents, upgrades, stateTracker, mapRouter, angulargmContainer) {

		///////////////////////////
		// Game alert messages //
		///////////////////////////

		var alertMessages = {};
		alertMessages.startLocation =
			"<h2>Where will you be starting?</h2><p>Select your hotel location on the map.</p>";
		alertMessages.greetings = {};
		alertMessages.greetings.morning =
			"<h2>Good morning!</h2><p>Where would you like to go today?</p>";
		alertMessages.greetings.afternoon =
			"<h2>It's the afternoon!</h2><p>Where would you like to go next?</p>";
		alertMessages.greetings.evening =
			"<h2>Good evening!</h2><p>What's your final destination for today?</p>";

		/////////////////////////
		// Current game state //
		/////////////////////////
		$scope.current = {};

		//////////////////
		// Game states //
		//////////////////

		// Current status
		$scope.current.state = stateTracker.new([{
			state: "intro"
			, set: "intro"
			, check: "isIntro"
		}, {
			state: "menu"
			, set: "menu"
			, check: "isMenu"
		}, {
			state: "playing"
			, set: "play"
			, check: "isPlaying"
		}, {
			state: "stats"
			, set: "end"
			, check: "isStats"
		}], "gameState");

		///////////////////////////
		// Game master controls //
		///////////////////////////
		$scope.game = {};

		function init() {
			stateTracker.new("loadingState").activate();

			// Currently active map configuration
			$scope.map.options = $scope.map.initConfig; // use initial configuration

			// Initially (before the game starts)
			mapCities();
		}
		init();

		$scope.game.start = function() {
			stateTracker.new("loadingState").activate();

			stateTracker.new("loadingState").$on("complete", function() {
				// Start the game
				$scope.current.state.play();
			}, true);

			// Map the landmarks
			mapLandmarks();

			// Create a resource tracker
			var resourceTracker = resources.new();
			resourceTracker.add(resources.categories.ALL, resources.types.MONEY, $scope.settings.budget);
			$scope.resources = resourceTracker;

			// Initial activities before the player can play turns
			initPlay();
		};
		$scope.game.end = function() {
			stateTracker.new("loadingState").activate();

			stateTracker.new("loadingState").$on("complete", function() {
				// End the game
				$scope.current.state.end();
			}, true);

			// Compute the stats
			$scope.calculateChartConfig();
		};
		$scope.game.menu = function() {
			stateTracker.new("loadingState").reset();

			stateTracker.new("loadingState").$on("complete", function() {
				// Back to the menu
				$scope.current.state.menu();
			}, true);

			init();
		};

		$scope.$on("event:screen:switch", function(event, options) {
			if(options.screen === 'menu')
				$scope.game.menu();
			else if(options.screen === 'game')
				$scope.game.start();
			else if(options.screen === 'results')
				$scope.game.end();
		});

		$scope.getDay = function() {
			return timer.now() ? timer.now().day : null;
		};

		$scope.setTimeOfDay = function() {
			$scope.displayedTimeOfDay = timer.now() ? timer.toTimeOfDay(timer.now().time) : null;
		};
		$scope.getTimeOfDay = function() {
			return $scope.displayedTimeOfDay;
		};

		/////////////////
		// Game turns //
		/////////////////

		$scope.turnState = stateTracker.new("turnState");

		function initPlay() {
			$scope.alertMessage = alertMessages.startLocation;
			stateTracker.new("loadingState").$on("complete", function() {
				stateTracker.get("alert").show();
			});

			$scope.current.location = null;
			$scope.locations.selected = null;

			// Set map options
			$scope.map.options = $scope.map.playConfig;
			$scope.map.options.mapStyle = "morning";
			// Notify map to refresh
			$scope.map.state.update();
		}

		// Set the selected location/point as the current start point
		$scope.game.setStartPoint = function() {

			// Update the map config with the start point
			$scope.current.location = $scope.locations.selected;
			$scope.locations.selected = null;
			$scope.map.options.selectable = "location";

			// Notify the map of the update
			$scope.map.state.update();

			// Dismiss the alert
			stateTracker.get("alert").dismiss();

			// Start the timer
			timer.config($scope.settings.travelDays, 3);
			timer.start();
			$scope.setTimeOfDay();

			// Show first greeting
			showAlert(alertMessages.greetings[$scope.getTimeOfDay()]);
			// greet();

			// Dismiss the alert as soon as the user begins picking landmarks
			$scope.$watch("locations.selected.id", function(newValue, oldValue) {
				if (angular.isDefined(newValue) && newValue !== oldValue)
					dismissAlert();
			});
		};

		// Check conditions for eligibility for another round
		$scope.game.canPlay = function(giveReason) {
			var deferred = $q.defer();

			// Landmark selected?
			if (!$scope.locations.selected)
				return giveReason ? 'Select a landmark to visit' : false;

			// Everything is permitted in sandbox mode (once a landmark is selected)
			if ($scope.settings.sandboxMode)
				return giveReason ? null : true;

			// Funds left for visiting/travelling/lodging?
			if ($scope.locations.selected.resources) {

				// At a minimum, check for visiting and transport feasibility
				var categoriesRequired = [resources.categories.VISITING, resources.categories.TRANSPORT];

				// If EOD, funds left for lodging?
				if (timer.isEOD())
					categoriesRequired.push(resources.categories.LODGING);

				// Check if we have the funds for this
				if (!resources.canMerge($scope.resources, $scope.locations.selected.resources,
					categoriesRequired))
					return giveReason ? 'Not enough funds' : false;
			}

			return giveReason ? null : true;
		};

		// Start this turn
		$scope.game.startTurn = function() {

			// Dismiss any greeting
			dismissAlert();
			// stateTracker.get("alert").dismiss();

			// Set the selected landmark as the current location
			$scope.current.location = $scope.locations.selected;
			// Restrict further selection to landmarks only
			// $scope.map.options.selectable = "location";
			// $scope.map.state.update();

			history.getInstance("landmarks").record(timer.toTimestamp(), $scope.current.location.id);

			// Charge for visiting costs and experience
			if ($scope.current.location.resources) {

				// For now, account for visiting and transport feasibility
				var categoriesRequired = [resources.categories.VISITING, resources.categories.TRANSPORT];

				resources.merge($scope.resources, $scope.current.location.resources, categoriesRequired);

				// One-time xp points for "discovery"
				if (!$scope.current.location.isVisited())
					resources.merge($scope.resources, $scope.current.location.resources, [resources.categories.DISCOVERY]);
			}

			$scope.turnState.activate();
		};

		$scope.game.canShop = function(giveReason) {
			// Funds left?
			if ($scope.current.location.resources) {
				if (!resources.canMerge($scope.resources, $scope.current.location.resources, [resources.categories
					.SHOPPING]))
					return giveReason ? 'Not enough funds' : false;
			}

			return giveReason ? null : true;
		};

		$scope.game.shop = function() {
			// Update shopping state
			stateTracker.get("shoppingState").purchase();

			// Charge for shopping
			resources.merge($scope.resources, $scope.current.location.resources, [resources.categories.SHOPPING]);

			// Record in history
			// You just shopped!
			history.getInstance("shopping").record(timer.toTimestamp(), resources);
			// What did you buy?
			history.getInstance("souvenirs").record(timer.toTimestamp(), $scope.current.location.shopping);
		};

		$scope.hasBought = function() {
			return history.getInstance("souvenirs").find($scope.current.location.shopping) !== null;
		};

		$scope.game.endTurn = function() {
			// Is this EOD?
			if (timer.isEOD()) {
				// Charge for lodging
				resources.merge($scope.resources, $scope.current.location.resources, [resources.categories.LODGING]);
			}

			// Make a random event, randomly
			if (randomEvents.hasOccurred())
				handleRandomEvent(randomEvents.getEvent());
			else
				closingActivities();
		};

		function closingActivities() {

			// Record today's state in history
			history.getInstance("resources").record(timer.toTimestamp(), $scope.resources);

			$scope.turnState.complete();

			// Days left?
			if (timer.isLast())
				$scope.game.end(); // end game

			// After a tiny gap between turns...
			$timeout(function() {

				// Next turn this day
				timer.next();
				$scope.setTimeOfDay();

				// Un-set as current location [FIXME]
				$scope.locations.selected = null;

				// Show greeting alert
				showAlert(alertMessages.greetings[$scope.getTimeOfDay()]);
				// greet();

			}, 500);
		}

		$scope.upgrades = upgrades.getUpgrades();

		// Random event
		function handleRandomEvent(randomEvent) {
			showRandomEvent(randomEvent).then(function() {

				// Charge for the impact if not countered
				if (randomEvent) {

					// Do we have a counter for this event?
					if(!randomEvents.getAvailableCounterTo(randomEvent)) {

						// If no, charge for it
						resources.merge($scope.resources, randomEvent.resources, [resources.categories.ALL]);

						// Get the upgrade to unlock
						var eventUpgrades = upgrades.get(randomEvent.unlocks);
						var upgrade = null;
						if (eventUpgrades) {
							// Pick the first upgrade we don't have
							if(angular.isArray(eventUpgrades)) {
								for(var i = 0, len = eventUpgrades.length; i < len; i++)
									if(!eventUpgrades[i].isUnlocked) {
										upgrade = eventUpgrades[i];
										break;
									}
							} else
								upgrade = eventUpgrades;
						}

						showUpgradeUnlocked(upgrade).then(function() {

							// Officially unlock the upgrade!
							if(upgrade) {
								// Add any resource bonuses
								resources.merge($scope.resources, upgrade.resources);

								// Mark as unlocked
								upgrade.isUnlocked = true;
							}

							$scope.upgradeUnlocked = null;
							$scope.randomEvent = null;
							closingActivities();

						});
					}

					// Else - no charges and no unlocks (too many unlocks!)
					else {
						$scope.randomEvent = null;
						closingActivities();
					}

				}
				else {
					$scope.randomEvent = null;
					closingActivities();
				}
			});
		}

		// Open a random event card
		function showRandomEvent(randomEvent) {
			var deferred = $q.defer();

			if (randomEvent) {

				$scope.randomEvent = randomEvent;
				$scope.$on("tpg:event:eventCard:close", function() {
					deferred.resolve();
				});

			}
			else
				deferred.resolve();

			return deferred.promise;
		}

		// Open an upgrade card
		function showUpgradeUnlocked(upgradeUnlocked) {
			var deferred = $q.defer();

			if (upgradeUnlocked) {

				$scope.upgradeUnlocked = upgradeUnlocked;
				$scope.$on("tpg:event:upgradeCard:close", function() {
					deferred.resolve();
				});

			}
			else
				deferred.resolve();

			return deferred.promise;
		}

		// Generic function to execute a "canI ?" function to supply a reason instead of just true/false
		$scope.whyCantI = function(task) {
			return task(true);
		};

		function showAlert(message, canGreet) {
			var alertTracker = stateTracker.get("alert");

			// Enqueue our intent to show until the current alert has been dismissed
			if (!canGreet) {
				$scope.alertUnbinder = alertTracker.$on("off", function() {
					showAlert(message, true);
				});
			}

			// When we can, show the alert asap
			else {
				$scope.alertMessage = message;

				if (angular.isFunction($scope.alertUnbinder))
					$scope.alertUnbinder();
				$scope.alertUnbinder = null;

				alertTracker.show();
			}
		}

		function dismissAlert() {
			var alertTracker = stateTracker.get("alert");

			if (alertTracker.isOn())
				alertTracker.dismiss();
		}

		function greet(canGreet) {
			// Enqueue our intent to show until the current alert has been dismissed
			if (!canGreet) {
				$scope.alertUnbinder = stateTracker.get("alert").$on("off", function() {
					greet(true);
				});
			}

			// When we can, show the alert asap
			else {
				$scope.setTimeOfDay();

				$scope.alertMessage = alertMessages.greetings[$scope.getTimeOfDay()];

				if (angular.isFunction($scope.alertUnbinder))
					$scope.alertUnbinder();
				$scope.alertUnbinder = null;

				stateTracker.get("alert").show();
			}
		}

		/////////////
		// Stats //
		/////////////

		$scope.chartConfig = null;

		function getResourceHistoryByType(category, type, multiplier) {
			var records = [];

			angular.forEach(history.getInstance("resources").retrieveAll(), function(resource, timestamp) {
				var restoredResource = resources.copy(resource);
				records.push(
					restoredResource.get(
						resources.categories[category]
						, resources.types[type]
					) * multiplier
				);
			});

			return records;
		}

		$scope.calculateChartConfig = function() {
			$scope.chartConfig = {
				options: {
					chart: {
						type: "spline"
					}
					, plotOptions: {
						series: {
							animation: {
								duration: 2000
							}
						}
					}
				}
				, series: [{
					data: getResourceHistoryByType("ALL", "MONEY", 1)
					, name: "Funds"
					, color: "#ffb03b"
					, lineWidth: 5
				}, {
					data: getResourceHistoryByType("ALL", "XP", 4)
					, name: "Experience Points"
					, color: "#d41200"
					, lineWidth: 5
				}, {
					data: getResourceHistoryByType("ALL", "SOUVENIR", 4)
					, name: "Souvenirs Collected"
					, color: "#27b3e6"
					, lineWidth: 5
				}]
				, title: {
					text: "Your Trip Analysis"
				}
				, credits: {
					enabled: false
				}
				, loading: false
			};
		};


		///////////////
		// Locations //
		///////////////

		$scope.locations = {};

		// Load the cities
		$scope.locations.cities = null; // cities
		locations.getCities().then(function(data) {
			$scope.locations.cities = data;
		});

		// Show the cities on the map
		function mapCities() {
			locations.getCities().then(function(data) {
				$scope.locations.cities = data;

				// Current status
				$scope.current.location = $scope.locations.cities[0];

				// Supply to the map
				$scope.map.initConfig.locations = $scope.locations.cities;
				// Notify update
				$scope.map.state.update();
			});
		}

		// Load the landmarks
		$scope.locations.landmarks = null; // landmarks
		locations.getLandmarks().then(function(data) {
			$scope.locations.landmarks = data;
		});

		// Show the landmarks on the map
		function mapLandmarks() {
			locations.getLandmarks().then(function(data) {
				$scope.locations.landmarks = data;

				// Current status
				$scope.current.location = null;

				// Supply to the map
				$scope.map.playConfig.locations = $scope.locations.landmarks;
				// Notify update
				$scope.map.state.update();
			});
		}

		// Currently selected location (city or landmark)
		$scope.locations.selected = null; // selected landmark for whatever reason

		/////////////////////
		// Game settings //
		/////////////////////
		$scope.settings = {};
		$scope.settings.budget = 1000;
		$scope.settings.travelDays = 3;

		///////////////////////
		// Game board/map  //
		///////////////////////

		$scope.map = {};

		$scope.map.state = stateTracker.new([{
			state: "unavailable"
			, set: "destroy"
			, check: "isUnavailable"
		}, {
			state: "updated"
			, set: "update"
			, check: "isUpdated"
		}, {
			state: "loading"
			, set: "load"
			, check: "isLoading"
		}, {
			state: "ready"
			, set: "ready"
			, check: "isReady"
		}], "mapState");

		// Available map configurations
		$scope.map.playConfig = {
			zoom: "auto" // number or auto
			, locations: null
			, selectable: "all" // all, point, location, none
			, focusOn: "auto" // auto, selected, current
			, disabled: false
			, showTransit: false
		};

		$scope.map.initConfig = {
			zoom: 2 // number or auto
			, locations: null
			, selectable: "none" // all, point, location, none
			, focusOn: "auto" // auto, selected, current
			, disabled: false
			, showTransit: false
		};

		// Currently active map configuration
		$scope.map.options = $scope.map.initConfig; // use initial configuration
	});
