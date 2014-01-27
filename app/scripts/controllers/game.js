angular.module("travelPlanningGame.app")
	.controller('GameCtrl', function($scope, $timeout, $q, timer, landmarks, resources, history,
		stateTracker, mapRouter) {

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
			resourceTracker.set(resources.categories.ALL, resources.types.MONEY, $scope.settings.budget);
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
			$scope.alertMessage =
				"<h2>Where will you be starting?</h2><p>Select your hotel location on the map.</p>";
			$timeout(function() {
				stateTracker.get("alert").show();
			}, 500);
		}

		// Set the selected location/point as the current start point
		$scope.game.setStartPoint = function() {
			$scope.current.location = $scope.locations.selected;
			$scope.locations.selected = null;
			$scope.map.options.selectable = "location";

			stateTracker.get("alert").dismiss();

			$scope.map.state.update();
		};

		// Check conditions for eligibility for another round
		$scope.game.canPlay = function(giveReason) {
			var deferred = $q.defer();

			// Landmark selected?
			if (!$scope.locations.selected)
				return giveReason ? 'Select a landmark to visit.' : false;

			// Everything is permitted in sandbox mode (once a landmark is selected)
			if ($scope.settings.sandboxMode)
				return giveReason ? null : true;

			// Funds left for visiting/travelling/lodging?
			var expectedCosts = resources.copy($scope.locations.selected.resources);
			// Add travel costs
			var travelCost = 0;
			if($scope.current.location) {
				var travelRoute = mapRouter.getRoute($scope.current.location, $scope.locations.selected);
				if(travelRoute)
					travelCost = travelRoute.getCost();
			}

			expectedCosts.set(resources.categories.VISITING, resources.types.MONEY,
				expectedCosts.get(resources.categories.VISITING, resources.types.MONEY) - travelCost
			);

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

		// Start this turn
		$scope.game.startTurn = function() {
			// Set the selected landmark as the current location
			$scope.current.location = $scope.locations.selected;
			// Restrict further selection to landmarks only
			$scope.map.options.selectable = "location";
			$scope.map.state.update();

			// Charge for visiting costs and experience
			resources.delta($scope.resources, resources.categories.ALL, $scope.current.location.resources,
				resources.categories.VISITING);

			// One-time xp points for "discovery"
			if (!history.getInstance("landmarks").find($scope.current.location))
				resources.delta($scope.resources, resources.categories.ALL, $scope.current.location.resources,
					resources.categories.DISCOVERY);

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
				$scope.game.end(); // end game

			// Record today's state in history
			history.getInstance("resources").record(timer.toTimestamp(), resources);
			history.getInstance("landmarks").record(timer.toTimestamp(), $scope.current.location);

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
			, selectable: "all" // all, point, location, none
			, focusOn: "auto" // auto, selected, current, none
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
