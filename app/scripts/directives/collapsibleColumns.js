'use strict';

angular.module('travelPlanningGame.app').directive('collapsibleColumns', function() {
	return {
		restrict: 'EA'
		, transclude: true
		, template: '<div class="collapsible-columns" ng-transclude></div>'
	};
}).directive('collapsibleColumn', function() {
	return {
		restrict: 'EA'
		, transclude: true
		, templateUrl: 'templates/collapsible-column.tpl.html'
		, require: '?ngModel'
		, scope: true
		, link: function(scope, elem, attrs, ngModel) {
			scope.collapsible = false;
			scope.defaultCollapsed = false;
			scope.collapsed = false;

			attrs.$observe('collapsible', function(value) {
				if (angular.isDefined(value) && value !== 'false') {
					scope.collapsible = true;
				} else {
					scope.collapsible = false;
				}
			});
			attrs.$observe('defaultCollapsed', function(value) {
				if (angular.isDefined(value) && value !== 'false') {
					scope.defaultCollapsed = true;
				} else {
					scope.defaultCollapsed = false;
				}
				scope.collapsed = scope.collapsible && scope.defaultCollapsed;
			});

			// Update whenver the model changes from outside
			if (ngModel) {
				ngModel.$render = function() {
					var value = ngModel.$viewValue;
					if (angular.isDefined(value) && value !== 'false') {
						scope.collapsed = true;
					}
				};

				// Update the model whenever changed
				scope.$watch('collapsed', function(newValue) {
					ngModel.$setViewValue(newValue);
				});
			}

			// Loading complete, fire the on-load event
			if (attrs.onLoad) {
				scope.$eval(attrs.onLoad);
			}
		}
	};
});
