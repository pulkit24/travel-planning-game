'use strict';

describe('Service: gameSettings', function() {

	// load the service's module
	beforeEach(module('travelPlanningGame.settings'));

	// instantiate service
	var gameSettings;
	beforeEach(inject(function(_gameSettings_) {
		gameSettings = _gameSettings_;
	}));

	it('should return correct default settings', function() {
		expect(gameSettings.getSettings().hasOwnProperty('finances')).toBe(true);
	});

});
