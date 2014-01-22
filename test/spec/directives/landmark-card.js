'use strict';

describe('Directive: landmarkCard', function() {

	// load the directive's module
	beforeEach(module('travelPlanningGame.app'));

	var element, scope, $httpBackend;

	beforeEach(inject(function($rootScope, _$httpBackend_) {
		scope = $rootScope.$new();
		$httpBackend = _$httpBackend_;
	}));

	it('should print a landmark card for the first landmark', inject(function($compile, landmarks) {
		$httpBackend.expectGET('landmarks.json').respond([{
			'name': 'Landmark 1'
			, 'visitingCost': '100'
			, 'lodgingCost': '500'
			, 'visitingExp': '10'
			, 'souvenirs': '10'
			, 'souvenirCost': '299'
			, 'exp': '15'
		}]);

		landmarks.get().then(function(landmarks) {
			element = angular.element('<landmark-card landmark="landmark"></landmark-card>');
			element = $compile(element)(scope);

			scope.landmarks = landmarks;
			scope.landmark = landmarks[0];

			expect(scope.landmark).toBeDefined();
			expect(scope.landmark.name).toBe('Landmark 1');

			scope.$digest();
		});
	}));
});
