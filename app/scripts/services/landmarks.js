'use strict';

angular.module('travelPlanningGame.app')
	.factory('landmarks', function() {

		var landmarks = [{
			name: 'Sentosa'
			, address: '8 Sentosa Gateway, Singapore 098269'
			, image: 'http://d3n8a8pro7vhmx.cloudfront.net/wearecrown/pages/15/attachments/original/1359687509/crown_casino_fire_show.jpg?1359687509'
			, lodgingCost: 200
			, visitingCost: 100
			, visitingExp: 5
			, souvenirs: 5
			, souvenirCost: 150
			, exp: 20
			, bonuses: [{
				flavour: 'Entertainment complex'
				, implication: 'high experience points'
				, icon: 'fa-star'
			}, {
				flavour: 'Luxury restaurants and shopping centre'
				, implication: 'costly visiting and shopping'
				, icon: 'fa-money'
			}, {
				flavour: 'Gambling hub'
				, implication: 'spend $700 and roll two dice: win $100 times the result'
				, icon: 'fa-trophy'
				, type: 'optional'
			}]
		}, {
			address: 'Pulau Ubin, Singapore'
		}, {
			address: 'Marina Bay, Singapore'
		}, {
			address: 'Bukit Batok Nature Park, Singapore'
		}, {
			address: '80 Mandai Lake Rd, Singapore 729826'
		}];

		var landmarksFactory = {};
		landmarksFactory.getLandmarks = function() {
			return landmarks;
		};

		return landmarksFactory;
	});
