'use strict';

describe('Service: landmarks', function() {

	// load the service's module
	beforeEach(module('travelPlanningGame.app'));

	// instantiate service
	var landmarks, $httpBackend;
	beforeEach(inject(function(_landmarks_, _$httpBackend_) {
		landmarks = _landmarks_;
		$httpBackend = _$httpBackend_;
	}));

	it('should fetch landmarks', function() {
		$httpBackend.expectGET('landmarks.json').respond([{
			'name': 'Landmark 1'
		}, {
			'name': 'Landmark 2'
		}]);
		landmarks.get().then(function(data) {
			expect(data.length).toBe(2);
		});
	});

});
