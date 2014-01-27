angular.module("travelPlanningGame.app")
	.factory("history", function() {

		///////////////////////
		// Records Manager //
		///////////////////////

		// Tracker for a single entity's history
		var History = function() {

			// History records indexed by timestamps
			this._records = {};

			// Add a record
			this.record = function addRecord(timestamp, state) {
				try {
					this._records[timestamp] = angular.toJson(state);
					return true;

				} catch (e) {
					return false;
				}
			};

			// Get a record
			this.retrieve = function getRecord(timestamp) {
				try {
					var marshalledState = this._records[timestamp];
					var state = angular.fromJson(marshalledState);
					return state;

				} catch (e) {
					return null;
				}
			};

			// Get all records
			this.retrieveAll = function getAllRecords() {
				var records = angular.copy(this._records);
				angular.forEach(records, function(marshalledState, timestamp) {
					records[timestamp] = angular.fromJson(marshalledState);
				});
				return records;
			};

			// Find a record - a value-based lookup
			// Returns the timestamp back
			this.find = function findRecord(state) {
				var marshalledState = angular.toJson(state);
				var foundTimestamp = null;

				angular.forEach(this._records, function(recordedState, timestamp) {
					if(marshalledState === recordedState)
						foundTimestamp = timestamp;
				});

				return foundTimestamp;
			};
		};

		////////////////////////////
		// Histories Manager //
		////////////////////////////

		// Registry of histories being maintained
		var registry = {};

		var _create = function createHistory() {
			return new History();
		};

		// Create or retrieve an existing history for the supplied name
		var getInstance = function(name) {
			var history = registry[name];

			if (!history) {
				history = _create();
				registry[name] = history;
			}

			return history;
		};

		return {
			getInstance: getInstance
		};
	});
