'use strict';

describe('Service: history', function() {

	// load the directive's module
	beforeEach(module('travelPlanningGame.app'));

	var history;

	beforeEach(inject(function(_history_) {
		history = _history_;
	}));

	it('should start a history for me', inject(function() {
		var myHistory = history.getInstance('test');
		expect(myHistory).toBeDefined();

		var myState = {
			key1: 'value1'
			, key2: 'value2'
		};
		myHistory.record('T1', myState);

		myState = {
			key1: 'value3'
			, key2: 'value4'
		};
		myHistory.record('T2', myState);

		expect(myHistory.retrieve('T1').key1).toBe('value1');
		expect(myHistory.retrieve('T2').key1).toBe('value3');
	}));
});
