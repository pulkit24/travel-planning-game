'use strict';

describe('Service: timer', function() {

	// load the directive's module
	beforeEach(module('travelPlanningGame.app'));

	var timer;

	beforeEach(inject(function(_timer_) {
		timer = _timer_;
		timer.config(2, 2);
	}));

	it('should be able to keep time', inject(function() {
		timer.start(); // 1, 1
		timer.next(); // 1, 2
		timer.next(); // 2, 1
		timer.next(); // 2, 2
		expect(timer.isLast()).toBe(true);
		expect(timer.next()).toBeFalsy();
	}));
});
