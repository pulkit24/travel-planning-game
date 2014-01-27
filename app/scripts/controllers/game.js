angular.module("travelPlanningGame.app")
	.controller('GameCtrl', function($scope, $timeout, $q, timer, landmarks, resources, history,
		stateTracker) {

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
			, set: "stats"
			, check: "isStats"
		}], "gameState");

		///////////////////////////
		// Game master controls //
		///////////////////////////
		$scope.game = {};
		$scope.game.start = function() {
			// Start the game
			$scope.current.state.play();

			// Create a resource tracker
			var resourceTracker = resources.new();
			resourceTracker.add(resources.categories.ALL, resources.types.MONEY, $scope.settings.budget);
			$scope.resources = resourceTracker;

			// Start the timer
			timer.config($scope.settings.travelDays, 3);
			timer.start();

			// Initial activities before the player can play turns
			initPlay();
		};
		$scope.game.end = function() {
			// End the game
			$scope.current.state.stats();
		};
		$scope.game.menu = function() {
			// Back to the menu
			$scope.current.state.menu();
		};

		$scope.getDay = function() {
			return timer.now().day;
		};

		/////////////////
		// Game turns //
		/////////////////

		function initPlay() {
			$timeout(function() {
				$scope.showAlert = true;
			}, 500);
		}

		$scope.game.setStartPoint = function() {
			$scope.current.location = $scope.locations.selected;
			$scope.locations.selected = null;
		};

		// Check conditions for eligibility for another round
		$scope.game.canPlay = function(giveReason) {
			// Landmark selected?
			if (!$scope.locations.selected)
				return giveReason ? 'Select a landmark to visit.' : false;

			// Everything is permitted in sandbox mode (once a landmark is selected)
			if ($scope.settings.sandboxMode)
				return giveReason ? null : true;

			// Funds left for visiting?
			if (!resources.canDelta($scope.resources, resources.categories.ALL, $scope.locations.selected.resources,
				resources.categories.VISITING))
				return giveReason ? 'Not enough funds to visit.' : false;

			// If EOD, funds left for lodging?
			if (timer.isEOD() && !resources.canDelta($scope.resources, resources.categories.ALL, $scope.locations
				.selected.resources,
				resources.categories.LODGING))
				return giveReason ? 'Not enough funds to stay.' : false;

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
			if (!resources.canDelta($scope.resources, resources.categories.ALL, $scope.current.location.resources,
				resources.categories.SHOPPING))
				return giveReason ? 'Not enough funds for shopping today.' : false;

			return giveReason ? null : true;
		};
		$scope.game.shop = function() {
			// Charge for shopping
			resources.delta($scope.resources, resources.categories.ALL, $scope.current.location.resources,
				resources.categories.SHOPPING);
		};
		$scope.game.endTurn = function() {
			// Is this EOD? Charge for lodging
			if (timer.isEOD())
				resources.delta($scope.resources, resources.categories.ALL, $scope.current.location.resources,
					resources.categories.LODGING);

			// Days left?
			if (timer.isLast())
				$scope.game.end();

			// Record today's state in history
			history.getInstance("resources").record(timer.toTimestamp(), resources);

			// Next turn this day
			timer.next();

			// Close the side bar
			$scope.isInTurn = false;

			// Un-set as current location [FIXME]
			$scope.locations.selected = null;
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
		landmarks.getCities().then(function(data) {
			$scope.locations.cities = data;
		});
		$scope.locations.landmarks = null; // landmarks
		landmarks.get().then(function(data) {
			$scope.locations.landmarks = data;

			// Supply to the map
			$scope.map.options.locations = $scope.locations.landmarks;
			// Notify update
			$scope.map.state.update();
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

		$scope.map.options = {
			zoom: 12
			, locations: null
			, selectable: "all"
			, focusOn: "selected"
			, disabled: false
			, showTransit: false
		};

		// Test function
		$scope.test = function() {
			$scope.locations.selected = null;
			$scope.map.options.selectable = "location";
			$scope.map.state.update();
		};
	});
