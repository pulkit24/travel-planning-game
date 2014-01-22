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
