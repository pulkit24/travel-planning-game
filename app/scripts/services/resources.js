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
			if (!original) original = 0;
			if (!delta) delta = 0;
			return original + delta >= 0;
		};
		// XP cannot go negative
		updateTests[types.XP] = function(original, delta) {
			if (!original) original = 0;
			if (!delta) delta = 0;
			return original + delta >= 0;
		};
		// Souvenirs cannot go negative
		updateTests[types.SOUVENIR] = function(original, delta) {
			if (!original) original = 0;
			if (!delta) delta = 0;
			return original + delta >= 0;
		};

		// Categories of events representing possible resource applications
		var categories = {};
		categories.ALL = "cat_all";
		categories.VISITING = "cat_visiting"; // example, visiting cost
		categories.TRANSPORT = "cat_transport";
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

			this._init = function initTrack(category, type) {
				// Create if no prevalent track
				if (!this[category])
					this[category] = {};
				if (!this[category][type])
					this[category][type] = 0;
			};

			// Set the value of a resource
			// Overwrites any existing value, and doesn't perform validation tests
			this.set = function setResource(category, type, amount) {
				this._init(category, type);
				this[category][type] = amount;

				return this;
			};

			// Ability to update the value of any resource
			// Checks are made to validate the update
			// Set skipTests to true to avoid resource validations, eg. during resource initialization
			this.update = function updateResource(category, type, amount, skipTests) {
				this._init(category, type);

				// Test whether the update is possible
				if (skipTests || (!updateTests[type] || updateTests[type](this[category][type], amount)))
					this[category][type] += amount;

				return this;
			};
			// Convenience functions for adding and subtracting amounts
			this.add = this.update;
			this.subtract = function subtractResource(category, type, amount, skipTests) {
				return this.update(category, type, -1 * amount, skipTests);
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

		// Check whether updating the demanding Resource by supplier Resource is possible
		// More than one supplier category can be provided to check against the sum amount
		function canDelta(demanderResource, demanderCategory, supplierResource, supplierCategories) {

			if (!supplierResource)
				return true;

			var possible = true;

			var summedResource = startTracker();

			// Consider each category
			angular.forEach(supplierCategories, function(supplierCategory, index) {
				angular.forEach(supplierResource[supplierCategory], function(amount, type) {
					summedResource.add(categories.ALL, type, amount, true); // coalesce all into ALL, skipping validation tests
				});
			});

			angular.forEach(summedResource[categories.ALL], function(amount, type) {
				if (updateTests[type] && !updateTests[type](demanderResource[demanderCategory][type], amount))
					possible = false;
			});

			return possible;
		}

		// Update source Resources by destination Resources on supplied categories only
		function delta(demanderResource, demanderCategory, supplierResource, supplierCategories) {
			if (supplierResource && canDelta(demanderResource, demanderCategory, supplierResource,
				supplierCategories)) {

				angular.forEach(supplierCategories, function(supplierCategory, index) {
					angular.forEach(supplierResource[supplierCategory], function(amount, type) {
						demanderResource.update(demanderCategory, type, amount);
					});
				});
			}

			return demanderResource;
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
