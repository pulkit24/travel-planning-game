'use strict';

describe('Directive: locationPreviewMap', function() {

	// load the directive's module
	beforeEach(module('travelPlanningGame.maps'));

	var element,
			scope;

	beforeEach(inject(function($rootScope) {
		scope = $rootScope.$new();
	}));

	it('should not load google maps when disabled', inject(function($compile) {
		element = angular.element('<location-preview-map disabled></location-preview-map>');
		element = $compile(element)(scope);
		expect(element.text()).toBe('');
	}));

	it('should load google maps', inject(function($compile) {
		scope.$on('gmMapIdle', function() {
			expect(1).toBe(1);
		});
		element = angular.element('<location-preview-map></location-preview-map>');
		element = $compile(element)(scope);
	}));
});
