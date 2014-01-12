'use strict';

angular.module('travelPlanningGame.app')
	.factory('landmarks', function() {

		var landmarks = [{
			name: 'Sentosa'
			, address: '8 Sentosa Gateway, Singapore 098269'
			, description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.'
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
			name: 'Pulau Ubin'
			, address: 'Pulau Ubin, Singapore'
			, description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.'
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
			name: 'Marina Bay'
			, address: 'Marina Bay, Singapore'
			, description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.'
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
			name: 'Bukit Batok Nature Park'
			, address: 'Bukit Batok Nature Park, Singapore'
			, description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.'
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
			name: 'Mandai Lake'
			, address: '80 Mandai Lake Rd, Singapore 729826'
			, description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.'
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
		}];

		var landmarksFactory = {};
		landmarksFactory.getLandmarks = function() {
			return landmarks;
		};

		return landmarksFactory;
	});
