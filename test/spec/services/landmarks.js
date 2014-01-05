'use strict';

describe('Service: landmarks', function () {

  // load the service's module
  beforeEach(module('travelPlanningGame.app'));

  // instantiate service
  var landmarks;
  beforeEach(inject(function (_landmarks_) {
    landmarks = _landmarks_;
  }));

  it('should have 5 landmarks', function () {
    expect(landmarks.getLandmarks().length).toBe(5);
  });

});
