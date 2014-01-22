'use strict';

describe('Service: days', function() {

	// load the service's module
	beforeEach(module('travelPlanningGame.app'));

	// instantiate service
	var days, bankingManager;
	beforeEach(inject(function(_days_, _bankingManager_) {
		days = _days_;
		bankingManager = _bankingManager_;
	}));

	it('should create a new day', function() {
		var finances = bankingManager.manage('test', 10000);
		var landmark = {visitingCost: 5000};

		days.newDay(finances).addLandmark(landmark).end();
		expect(days.getAllDays().length).toBe(1);
		expect(finances.getBudget()).toBe(5000);
	});

	it('should detect already visited landmarks', function() {
		var finances = bankingManager.manage('test', 10000);
		var landmark1 = {id: 1, exp: 10};
		var landmark2 = {id: 2, exp: 5};

		days.newDay(finances).addLandmark(landmark1).end();
		expect(finances.getXP()).toBe(10);
		days.newDay(finances).addLandmark(landmark1).end();
		expect(finances.getXP()).toBe(10);
		days.newDay(finances).addLandmark(landmark2).end();
		expect(finances.getXP()).toBe(15);
	});
});
