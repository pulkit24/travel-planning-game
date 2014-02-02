angular.module("travelPlanningGame.app")
	.controller('GameCtrl', function($scope, $timeout, $q, timer, locations, resources, history,
		randomEvents, stateTracker, mapRouter, angulargmContainer) {

		///////////////////////////
		// Game alert messages //
		///////////////////////////

		var alertMessages = {};
		alertMessages.startLocation = "<h2>Where will you be starting?</h2><p>Select your hotel location on the map.</p>";
		alertMessages.greetings = {};
		alertMessages.greetings.morning = "<h2>Good morning!</h2><p>Where would you like to go today?</p>";
		alertMessages.greetings.afternoon = "<h2>It's the afternoon!</h2><p>Where would you like to go next?</p>";
		alertMessages.greetings.evening = "<h2>Good evening!</h2><p>What's your final destination for today?</p>";

		/////////////////////////
		// Current game state //
		/////////////////////////
		$scope.current = {};

		//////////////////
		// Game states //
		//////////////////

		// Current status
		$scope.current.state = stateTracker.new([{
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

		// Initially (before the game starts)
		mapCities();

		$scope.game.start = function() {
			// Start the game
			$scope.current.state.play();

			// Map the landmarks
			mapLandmarks();

			// Create a resource tracker
			var resourceTracker = resources.new();
			resourceTracker.add(resources.categories.ALL, resources.types.MONEY, $scope.settings.budget);
			resourceTracker.addFilter(resources.categories.VISITING, resources.types.MONEY, 0.5, resources.operations.MULTIPLY, 1);
			$scope.resources = resourceTracker;

			// Initial activities before the player can play turns
			initPlay();
		};
		$scope.game.end = function() {
			// End the game
			$scope.current.state.end();
		};
		$scope.game.menu = function() {
			// Back to the menu
			$scope.current.state.menu();
		};

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
			$timeout(function() {
				stateTracker.get("alert").show();
			}, 500);

			// Set map options
			$scope.map.options = $scope.map.playConfig;
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

			// Show first greeting
			greet();
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
				if (!resources.canMerge($scope.resources, $scope.locations.selected.resources, categoriesRequired))
					return giveReason ? 'Not enough funds' : false;
			}

			return giveReason ? null : true;
		};

		// Start this turn
		$scope.game.startTurn = function() {

			// Dismiss any greeting
			stateTracker.get("alert").dismiss();

			// Set the selected landmark as the current location
			$scope.current.location = $scope.locations.selected;
			// Restrict further selection to landmarks only
			$scope.map.options.selectable = "location";
			$scope.map.state.update();

			// Charge for visiting costs and experience
			if ($scope.current.location.resources) {

				// For now, account for visiting and transport feasibility
				var categoriesRequired = [resources.categories.VISITING, resources.categories.TRANSPORT];

				resources.merge($scope.resources, $scope.current.location.resources, categoriesRequired);

				// One-time xp points for "discovery"
				if (!history.getInstance("landmarks").find($scope.current.location))
					resources.merge($scope.resources, $scope.current.location.resources, [resources.categories.DISCOVERY]);
			}

			$scope.turnState.activate();
		};

		$scope.game.canShop = function(giveReason) {
			// Funds left?
			if ($scope.current.location.resources) {
				if (!resources.canMerge($scope.resources, $scope.current.location.resources, [resources.categories.SHOPPING]))
					return giveReason ? 'Not enough funds' : false;
			}

			return giveReason ? null : true;
		};

		$scope.game.shop = function() {
			// Update shopping state
			stateTracker.get("shoppingState").purchase();

			$scope.current.

			// Charge for shopping
			resources.merge($scope.resources, $scope.current.location.resources, [resources.categories.SHOPPING]);

			// Record in history
			history.getInstance("shopping").record(timer.toTimestamp(), resources);
		};

		$scope.game.endTurn = function() {
			$scope.turnState.complete();

			// Is this EOD?
			if (timer.isEOD()) {
				// Charge for lodging
				resources.merge($scope.resources, $scope.current.location.resources, [resources.categories.LODGING]);
			}

			// Make a random event, randomly
			if(randomEvents.hasOccurred())
				handleRandomEvent(randomEvents.getEvent());

			// Record today's state in history
			history.getInstance("resources").record(timer.toTimestamp(), resources);
			history.getInstance("landmarks").record(timer.toTimestamp(), $scope.current.location);

			// Days left?
			if (timer.isLast())
				$scope.game.end(); // end game

			// After a tiny gap between turns...
			$timeout(function(){

				// Next turn this day
				timer.next();

				// Un-set as current location [FIXME]
				$scope.locations.selected = null;

				// Show greeting alert
				greet();

			}, 500);
		};

		// Random event
		function handleRandomEvent(randomEvent) {
			if(randomEvent) {
				$scope.randomEvent = randomEvent;

				// Charge for the impact
				resources.merge($scope.resources, randomEvent.resources, [resources.categories.ALL]);

				// If there's an upgrade unlocked?
			}
		}

		// Generic function to execute a "canI ?" function to supply a reason instead of just true/false
		$scope.whyCantI = function(task) {
			return task(true);
		};

		function greet(canGreet) {
			// Enqueue our intent to show until the current alert has been dismissed
			if(!canGreet) {
				$scope.alertUnbinder = stateTracker.get("alert").$on("off", function() {
					greet(true);
				});
			}

			// When we can, show the alert asap
			else {
				$scope.setTimeOfDay();

				$scope.alertMessage = alertMessages.greetings[$scope.getTimeOfDay()];

				if(angular.isFunction($scope.alertUnbinder))
					$scope.alertUnbinder();
				$scope.alertUnbinder = null;

				stateTracker.get("alert").show();
			}
		}

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
		$scope.settings.travelDays = 4;

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
			zoom: 1 // number or auto
			, locations: null
			, selectable: "none" // all, point, location, none
			, focusOn: "auto" // auto, selected, current
			, disabled: false
			, showTransit: false
		};

		// Currently active map configuration
		$scope.map.options = $scope.map.initConfig; // use initial configuration

	});
