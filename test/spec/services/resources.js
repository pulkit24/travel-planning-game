'use strict';

describe('Service: resources', function() {

	// load the directive's module
	beforeEach(module('travelPlanningGame.app'));

	var resources;

	beforeEach(inject(function(_resources_) {
		resources = _resources_;
	}));

	it('should have create a tracker', inject(function() {
		var tracker = resources.new();
		expect(tracker).toBeDefined();
		expect(tracker.get(resources.categories.ALL, resources.types.MONEY)).toBe(0);
	}));

	it('should have update the tracker', inject(function() {
		var tracker = resources.new().add(resources.categories.ALL, resources.types.MONEY, 100);
		expect(tracker).toBeDefined();
		expect(tracker.get(resources.categories.ALL, resources.types.MONEY)).toBe(100);
	}));

	it('should not update illegally', inject(function() {
		var tracker = resources.new().add(resources.categories.ALL, resources.types.MONEY, 100)
		.subtract(resources.categories.ALL, resources.types.MONEY, 200);
		expect(tracker).toBeDefined();
		expect(tracker.get(resources.categories.ALL, resources.types.MONEY)).toBe(100);
	}));

	it('should have be able to delta across trackers', inject(function() {
		var tracker1 = resources.new().add(resources.categories.ALL, resources.types.MONEY, 100);
		var tracker2 = resources.new().add(resources.categories.VISITING, resources.types.MONEY, 150);
		resources.delta(tracker1, resources.categories.ALL, tracker2, resources.categories.VISITING);
		expect(tracker1.get(resources.categories.ALL, resources.types.MONEY)).toBe(250);
	}));

});
