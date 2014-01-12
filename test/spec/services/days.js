'use strict';

describe('Service: days', function() {

	// load the service's module
	beforeEach(module('travelPlanningGame.app'));

	// instantiate service
	var days, landmarks;
	beforeEach(inject(function(_days_, _landmarks_) {
		days = _days_;
		landmarks = _landmarks_;
	}));

	it('should create a new day', function() {
		days.newDay(10000).end();
		expect(days.getAllDays().length).toBe(1);
		expect(days.getDay(0).finances.budget).toBe(10000);
	});

	it('should detect already visited landmarks', function() {
		days.newDay(10000).addLandmark(landmarks.getLandmarks()[0]).end();
		expect(days.getAllDays().length).toBe(1);
		expect(days.getDay(0).gains.xp).toBe(25);
		expect(days.getDay(0).finances.expenses.general).toBe(300);
		days.newDay(10000).addLandmark(landmarks.getLandmarks()[0]).end();
		expect(days.getDay(1).gains.xp).toBe(5);
	});
});
