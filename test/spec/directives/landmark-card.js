'use strict';

describe('Directive: landmarkCard', function() {

	// load the directive's module
	beforeEach(module('travelPlanningGame.app'));
	beforeEach(module('templates'));

	var element,
			scope;

	beforeEach(inject(function($rootScope, landmarks) {
		scope = $rootScope.$new();
		scope.landmarks = landmarks.getLandmarks();
		scope.landmark = scope.landmarks[0];
	}));

	it('should print a landmark card for the first landmark', inject(function($compile) {
		element = angular.element('<landmark-card landmark="landmark"></landmark-card>');
		element = $compile(element)(scope);

		expect(scope.landmark).toBeDefined();
		expect(scope.landmark.name).toBe('Sentosa');

		scope.$digest();
	}));
});
