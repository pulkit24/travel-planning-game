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


			this.retrieve = function getRecord(timestamp) {
				try {
					var marshalledState = this._records[timestamp];
					var state = angular.fromJson(marshalledState);
					return state;

				} catch (e) {
					return null;
				}
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
