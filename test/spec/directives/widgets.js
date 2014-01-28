'use strict';

describe('Directive: widgets', function() {

	// load the directive's module
	beforeEach(module('travelPlanningGame.widgets'));
	beforeEach(module('travelPlanningGame.app'));

	var element, scope, resources, $httpBackend;

	beforeEach(inject(function($rootScope, _$httpBackend_, _resources_) {
		$httpBackend = _$httpBackend_;
		resources = _resources_;
		scope = $rootScope.$new();
		scope.resources = resources.new().add(resources.categories.ALL, resources.types.MONEY, 100);
		$httpBackend.expectGET('../landmarks.json').respond(null);
		$httpBackend.expectGET('../cities.json').respond(null);
	}));

	it('should make a resource indicator', inject(function($compile) {
		element = angular.element('<widget-resource-indicator type="MONEY" category"ALL" resources="resources"></widget-resource-indicator>');
		element = $compile(element)(scope);
		scope.$digest();
		expect(element).toBeDefined();
	}));
});
