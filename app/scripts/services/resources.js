angular.module("travelPlanningGame.app")
	.factory("resources", function() {

		// Resource types
		var types = {};
		types.ALL = "type_all";
		types.MONEY = "type_money";
		types.XP = "type_xp";
		types.SOUVENIR = "type_souvenir";

		// Categories of events representing possible resource applications
		var categories = {};
		categories.ALL = "cat_all"; // special case: equivalent to each of the other categories
		categories.VISITING = "cat_visiting"; // example, visiting cost
		categories.TRANSPORT = "cat_transport";
		categories.LODGING = "cat_lodging";
		categories.SHOPPING = "cat_shopping"; // example, shopping gains
		categories.DISCOVERY = "cat_discovery"; // i.e. one-time events
		// add other categories dynamically as needed

		// Operations possible for filters to be applied on resources
		var operations = {};
		operations.ADD = "op_add";
		operations.MULTIPLY = "op_multiply";

		// Track resources for the caller
		var Resources = function() {

			this.types = types;
			this.categories = categories;
			this.operations = operations;

			// Get the value of a resource
			// Safer alternative to manually access the object properties
			this.get = function getResource(category, type) {
				if (this[category] && this[category][type])
					return this[category][type];
				else
					return 0;
			};

			// Initialize a track for a particular category and type
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
			// Checks for validation unless specified to skip
			this.update = function updateResource(category, type, amount, skipTests) {
				this._init(category, type);

				if(skipTests || (this[category][type] + amount > 0))
					this[category][type] += amount;

				return this;
			};

			// Convenience functions for adding and subtracting amounts
			this.add = this.update;
			this.subtract = function subtractResource(category, type, amount, skipTests) {
				return this.update(category, type, -1 * amount, skipTests);
			};

			// Add filters
			this._filters = [];
			this.addFilter = function addFilter(category, type, amount, operation, times) {
				var newFilter = new Filter(category, type, amount, operation, times);
				this._filters.push(newFilter);
			};

			this.filter = function applyFilters(category, type, amount, isTest){
				for(var i = 0, len = this._filters.length; i < len; i++)
					amount = this._filters[i].apply(category, type, amount, isTest);

				return amount;
			};
			this.getFilters = function getAllFilters() {
				return this._filters;
			};
		};

		// Filters - attached to each resource
		// Use to filter updates to a resource (example 50% discount)
		var Filter = function(filterCategory, filterType, filterAmount, filterOperation, filterTimes) {
			this.category = filterCategory;
			this.type = filterType;
			this.modifier = filterAmount;
			this.operation = filterOperation;
			this.times = filterTimes;

			this.apply = function applyFilter(category, type, amount, isTest) {
				if(this.times !== 0) {
					if(this.category === category && this.type === type) {
						amount = this.modify(amount);
						if(!isTest)
							this.times--;
					}
				}

				return amount;
			};

			this.modify = function performOperation(amount) {
				if(this.operation === operations.ADD)
					return parseInt(amount + this.modifier, 10);
				else if(this.operation === operations.MULTIPLY)
					return parseInt(amount * this.modifier, 10);
				else
					return amount;
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

		// Check whether updating the target resource by the source resource is possible
		// on supplied categories (if any)
		function canAddResource(targetResource, sourceResource, categoriesToConsider) {

			// Final answer
			var possible = true;

			// Can we legally add the resource?
			if (sourceResource) {

				// Yes. Do we have a limitation on categories to consider?
				if(!categoriesToConsider)
					categoriesToConsider = categories; // No, consider all categories

				// Check if we can add resources from each category
				angular.forEach(categoriesToConsider, function(category, index) {
					angular.forEach(sourceResource[category], function(amount, type) {

						// Apply any filters to the amount
						if(category !== categories.ALL)
							amount = targetResource.filter(category, type, amount, true); // specific category filter, if any
						amount = targetResource.filter(categories.ALL, type, amount, true); // generic catch-all filter, if any

						// Does the target resource have an ALL category?
						if(targetResource[categories.ALL])
							possible = possible && (targetResource.get(categories.ALL, type) + amount > 0); // yes, can we update that as a catch-all?
						else
							possible = possible && (targetResource.get(category, type) + amount > 0); // no, can we update the corresponding category?
					});
				});
			}

			return possible;
		}

		// Update target resources by source resources on supplied categories (if any)
		function addResource(targetResource, sourceResource, categoriesToConsider) {

			// Can we legally add the resource?
			if (sourceResource && canAddResource(targetResource, sourceResource, categoriesToConsider)) {

				// Yes. Do we have a limitation on categories to consider?
				if(!categoriesToConsider)
					categoriesToConsider = categories; // No, consider all categories

				// Add resources from each category
				angular.forEach(categoriesToConsider, function(category, index) {
					angular.forEach(sourceResource[category], function(amount, type) {

						// Apply any filters to the amount
						if(category !== categories.ALL)
							amount = targetResource.filter(category, type, amount); // specific category filter, if any
						amount = targetResource.filter(categories.ALL, type, amount); // generic catch-all filter, if any

						// Does the target resource have an ALL category?
						if(targetResource[categories.ALL])
							targetResource.update(categories.ALL, type, amount); // yes, update that as a catch-all
						else
							targetResource.update(category, type, amount); // no, update the corresponding category
					});
				});

				// Copy the filters too, if available
				angular.forEach(sourceResource.getFilters(), function(filter, index) {
					targetResource.addFilter(filter.category, filter.type, filter.modifier, filter.operation, filter.times);
				});
			}

			return targetResource;
		}

		return {
			new: startTracker
			, copy: duplicateTracker
			, canMerge: canAddResource
			, merge: addResource
			, types: types
			, categories: categories
			, operations: operations
		};
	});
