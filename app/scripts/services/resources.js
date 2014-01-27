angular.module("travelPlanningGame.app")
	.factory("resources", function() {

		// Resource types
		var types = {};
		types.ALL = "type_all";
		types.MONEY = "type_money";
		types.XP = "type_xp";
		types.SOUVENIR = "type_souvenir";

		// Test conditions for updating these types
		var updateTests = {};
		// Money after update must not go negative
		updateTests[types.MONEY] = function(original, delta) {
			if(!original) original = 0;
			if(!delta) delta = 0;
			return original + delta >= 0;
		};
		// XP cannot go negative
		updateTests[types.XP] = function(original, delta) {
			if(!original) original = 0;
			if(!delta) delta = 0;
			return original + delta >= 0;
		};
		// Souvenirs cannot go negative
		updateTests[types.SOUVENIR] = function(original, delta) {
			if(!original) original = 0;
			if(!delta) delta = 0;
			return original + delta >= 0;
		};

		// Categories of events representing possible resource applications
		var categories = {};
		categories.ALL = "cat_all";
		categories.VISITING = "cat_visiting"; // example, visiting cost
		categories.LODGING = "cat_lodging";
		categories.SHOPPING = "cat_shopping"; // example, shopping gains
		categories.DISCOVERY = "cat_discovery"; // i.e. one-time events
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

			// Set the value of a resource
			// Only use this at the start, to initial the resources
			// as this function doesn't impose resource validations
			this.set = function setResource(category, type, amount) {
				// Create if no prevalent track
				if (!this[category])
					this[category] = {};
				if (!this[category][type])
					this[category][type] = 0;

				this[category][type] += amount;
				return this;
			};

			// Ability to update the value of any resource
			// Checks are made to validate the update
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

		function duplicateTracker(tracker) {
			var trackerCopy = new Resources();
			angular.forEach(categories, function(category, index) {
				trackerCopy[category] = angular.copy(tracker[category]);
			});
			return trackerCopy;
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
			, copy: duplicateTracker
			, canDelta: canDelta
			, delta: delta
			, types: types
			, categories: categories
		};
	});
