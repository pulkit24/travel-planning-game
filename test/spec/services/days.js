'use strict';

describe('Service: days', function() {

	// load the service's module
	beforeEach(module('travelPlanningGame.app'));

	// instantiate service
	var days;
	beforeEach(inject(function(_days_) {
		days = _days_;
	}));

	it('should create a new day', function() {
		days.newDay(10000).end();
		expect(days.getAllDays().length).toBe(1);
		expect(days.getDay(0).finances.budget).toBe(10000);
	});

});
