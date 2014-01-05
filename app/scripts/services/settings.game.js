'use strict';

angular.module('travelPlanningGame.settings')
	.factory('gameSettings', function() {

		///////////////////////
		// Game parameters //
		///////////////////////
		var settings = {};

		// Financial parameters
		settings.finances = {};
		settings.finances.budget = 40000;
		settings.finances.upgradesAvailable = {};
		settings.finances.upgradesAvailable.travelCard = false;

		// Location parameters
		settings.locations = [
			{city: 'Singapore', country: 'Singapore', enabled: true}
			, {city: 'Tokyo', country: 'Japan', enabled: false}
			, {city: 'Melbourne', country: 'Australia', enabled: false}
		];
		settings.selectedLocation = 0;

		// Other game parameters
		settings.daysOfTravel = 0;
		settings.sandboxMode = false;

		////////////////////////////////////////////////
		// Public functions to access game settings //
		////////////////////////////////////////////////

		var gameSettings = {};
		gameSettings.getSettings = function() {
			return settings;
		};

		return gameSettings;
	});
