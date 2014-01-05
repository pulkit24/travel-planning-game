'use strict';

angular.module('travelPlanningGame.app')
	.factory('landmarks', function() {

		var landmarks = [
			{
				address: '8 Sentosa Gateway, Singapore 098269'
			}
			, {
				address: 'Pulau Ubin, Singapore'
			}
			, {
				address: 'Marina Bay, Singapore'
			}
			, {
				address: 'Bukit Batok Nature Park, Singapore'
			}
			, {
				address: '80 Mandai Lake Rd, Singapore 729826'
			}
		];

		var landmarksFactory = {};
		landmarksFactory.getLandmarks = function() {
			return landmarks;
		};

		return landmarksFactory;
	});
