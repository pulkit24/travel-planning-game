'use strict';

angular.module('travelPlanningGame.settings')
  .factory('userSettings', function () {
    // Service logic
    // ...

    var meaningOfLife = 42;

    // Public API here
    return {
      someMethod: function () {
        return meaningOfLife;
      }
    };
  });
