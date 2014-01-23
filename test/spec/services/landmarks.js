'use strict';

describe('Service: landmarks', function() {

	// load the directive's module
	beforeEach(module('travelPlanningGame.app'));

	var landmarks, resources, $httpBackend;

	beforeEach(inject(function(_landmarks_, _resources_, _$httpBackend_) {
		landmarks = _landmarks_;
		resources = _resources_;
		$httpBackend = _$httpBackend_;
	}));

	it('should have some landmarks', inject(function() {
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
			expect(landmarks.length).toBe(1);
			expect(landmarks[0].resources[resources.categories.VISITING][resources.types.XP]).toBe('10');
		});
	}));
});
