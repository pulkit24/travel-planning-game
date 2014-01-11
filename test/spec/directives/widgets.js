'use strict';

describe('Directive: widgets', function() {

	// load the directive's module
	beforeEach(module('travelPlanningGame.widgets'));
	beforeEach(module('templates'));

	var element,
			scope;

	beforeEach(inject(function($rootScope) {
		scope = $rootScope.$new();
		scope.value = 100;
	}));

	it('should make a resource indicator', inject(function($compile) {
		element = angular.element('<widget-resource-indicator ng-model="value"></widget-resource-indicator>');
		element = $compile(element)(scope);
		scope.$digest();
		expect(element).toBeDefined();
	}));
});
