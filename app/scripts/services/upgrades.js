angular.module("travelPlanningGame.app")
	.factory("upgrades", function($q, $http, resources) {

		// Source files
		var source_upgrades = "../upgrades.json";

		// List of upgrades
		var upgrades = null;

		// Fetch upgrades
		function loadUpgrades() {
			var deferred = $q.defer();

			if (!upgrades) {
				$http.get(source_upgrades)
					.success(function(data) {
						// Fulfill promise on success
						upgrades = data;
						// Process each event
						angular.forEach(upgrades, function(upgrade, index) {
							// Prepare a resource tracker with the filter
							upgrade.resources = _createResourceFilter(upgrade);

							// Mark as currently locked
							upgrade.isUnlocked = false;
						});
						deferred.resolve(upgrades);
					})
					.error(function(data) {
						// Reject with failure
						deferred.reject();
					});
			}
			else {
				deferred.resolve(upgrades);
			}

			return deferred.promise;
		}

		function getUpgrades() {
			return upgrades;
		}

		function getByName(name) {
			for(var i = 0, len = upgrades.length; i < len; i++)
				if(upgrades[i].name === name)
					return upgrades[i];

			return null;
		}

		function getByID(id) {
			for(var i = 0, len = upgrades.length; i < len; i++)
				if(upgrades[i].id === id)
					return upgrades[i];

			return null;
		}

		// Add resource tracker with the filter
		function _createResourceFilter(upgrade) {
			var resourceTracker = resources.new();

			if(upgrade.resource)
				resourceTracker.set(resources.categories.ALL
					, resources.types[upgrade.resource.type]
					, upgrade.resource.amount);

			if(upgrade.bonus)
				resourceTracker.addFilter(resources.categories[upgrade.bonus.category]
					, resources.types[upgrade.bonus.type]
					, upgrade.bonus.amount
					, resources.operations[upgrade.bonus.operation]
					, -1);

			return resourceTracker;
		}

		return {
			load: loadUpgrades
			, getUpgrades: getUpgrades
			, get: getByID
		};
	});
