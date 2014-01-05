'use strict';

describe('Directive: gameMap', function() {

	// load the directive's module
	beforeEach(module('travelPlanningGame.maps'));

	var element,
			scope;

	beforeEach(inject(function($rootScope) {
		scope = $rootScope.$new();
	}));

	it('should not load google maps when disabled', inject(function($compile) {
		element = angular.element('<game-map disabled></game-map>');
		element = $compile(element)(scope);
		expect(element.text()).toBe('');
	}));

	it('should load google maps', inject(function($compile) {
		scope.$on('gmMapIdle', function() {
			expect(1).toBe(1);
		});
		element = angular.element('<game-map></game-map>');
		element = $compile(element)(scope);
	}));

	it('should have coords for the landmark addresses', inject(function($compile) {
		var landmarks = ['8 Sentosa Gateway, Singapore 098269'];
		scope.$on('gmMapIdle', function() {
			expect(scope.availableLocations.length).toBe(1);
			expect(scope.availableLocations[0].id).toBe(0);
			expect(scope.availableLocations[0].coords.hasOwnProperty('lat')).toBe(true);
		});
		element = angular.element('<game-map available-locations="landmarks"></game-map>');
		element = $compile(element)(scope);
	}));
});
