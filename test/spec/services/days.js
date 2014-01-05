'use strict';

describe('Service: days', function () {

  // load the service's module
  beforeEach(module('travelPlanningGame.app'));

  // instantiate service
  var days;
  beforeEach(inject(function (_days_) {
    days = _days_;
  }));

  it('should do something', function () {
    expect(!!days).toBe(true);
  });

});
