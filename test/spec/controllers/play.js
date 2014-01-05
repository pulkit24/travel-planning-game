'use strict';

describe('Controller: PlayCtrl', function() {

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

	var landmarks;
	beforeEach(inject(function(_landmarks_) {
		landmarks = _landmarks_;
	}));

	// Initialize the controller and a mock scope
	beforeEach(inject(function($controller, $rootScope, gameSettings, landmarks) {
		scope = $rootScope.$new();
		StartCtrl = $controller('PlayCtrl', {
			$scope: scope
			, gameSettings: gameSettings
			, landmarks: landmarks
		});
	}));

	it('game settings should be available', function() {
		expect(scope.settings.game.finances.budget).toBe(40000);
		expect(scope.settings.game.selectedLocation).toBe(0);
		expect(scope.settings.game.locations.length).toBe(3);
	});
	it('landmarks should be available', function() {
		expect(scope.landmarks.length).toBe(5);
	});

	it('first day budget should be set by default', function() {
		expect(scope.play.settings.finances.budget).toBe(40000);
	});

});
