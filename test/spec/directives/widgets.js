'use strict';

describe('Directive: widgets', function() {

	// load the directive's module
	beforeEach(module('travelPlanningGame.widgets'));

	var element, scope, resources;

	beforeEach(inject(function($rootScope, _resources_) {
		resources = _resources_;
		scope = $rootScope.$new();
		scope.value = 100;
	}));

	it('should make a resource indicator', inject(function($compile) {
		element = angular.element('<widget-resource-indicator type="MONEY" category"ALL" resources="resources"></widget-resource-indicator>');
		element = $compile(element)(scope);
		scope.$digest();
		expect(element).toBeDefined();
	}));
});
