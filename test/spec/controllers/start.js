'use strict';

describe('Controller: StartCtrl', function() {

	// load the controller's module
	beforeEach(module('AngularGM'));
	beforeEach(module('travelPlanningGame.maps'));
	beforeEach(module('travelPlanningGame.app'));

	var StartCtrl,
		scope;

	// instantiate service
	var gameSettings;
	beforeEach(inject(function(_gameSettings_) {
		gameSettings = _gameSettings_;
	}));

	// Initialize the controller and a mock scope
	beforeEach(inject(function($controller, $rootScope, gameSettings) {
		scope = $rootScope.$new();
		StartCtrl = $controller('StartCtrl', {
			$scope: scope
			, gameSettings: gameSettings
		});
	}));

	it('game settings should be available', function() {
		expect(scope.settings.game.finances.budget).toBe(40000);
		expect(scope.settings.game.selectedLocation).toBe(0);
		expect(scope.settings.game.locations.length).toBe(3);
	});
});
