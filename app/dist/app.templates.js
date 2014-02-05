angular.module('travelPlanningGame.templates', ['templates/landmark-card.tpl.html', 'templates/loading.tpl.html', 'templates/maps.game.tpl.html', 'templates/random-event-card.tpl.html', 'templates/upgrade-card.tpl.html', 'templates/widgets.alert.tpl.html', 'templates/widgets.day-counter.tpl.html', 'templates/widgets.resource-indicator.tpl.html']);

angular.module('templates/landmark-card.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/landmark-card.tpl.html',
    '<!-- Landmark card -->\n' +
    '<div class="landmark-card panel panel-primary">\n' +
    '\n' +
    '	<!-- Landmark name and controls -->\n' +
    '	<div class="panel-header panel-heading">\n' +
    '\n' +
    '		<!-- Controls -->\n' +
    '		<i class="fa close fa-times fa-fw"\n' +
    '			state-tracker="landmarkCardState"\n' +
    '			ng-click="landmarkCardState.complete()"></i>\n' +
    '		<!-- <i class="fa close fa-rotate-left fa-fw" ng-click="isFlipped = !isFlipped"></i> -->\n' +
    '\n' +
    '		<h3>{{ landmark.name }}</h3>\n' +
    '	</div>\n' +
    '	<!-- end name and controls -->\n' +
    '\n' +
    '	<!-- Image and quick stats -->\n' +
    '	<div class="panel-body" ng-style="{\'background-image\': \'url(\' + landmark.image + \')\'}">\n' +
    '		<div class="col-xs-offset-9">\n' +
    '			<div class="thumbnail resource text-center">\n' +
    '				<small>LODGING</small>\n' +
    '				<h3>{{ landmark.lodgingCost }} <i class="fa fa-dollar"></i>\n' +
    '				</h3>\n' +
    '				<small>PER DAY</small>\n' +
    '			</div>\n' +
    '			<div class="thumbnail resource text-center">\n' +
    '				<small>VISITING</small>\n' +
    '				<h3>{{ landmark.visitingCost }} <i class="fa fa-dollar"></i>\n' +
    '				</h3>\n' +
    '				+{{ landmark.visitingExp }} <i class="fa fa-star"></i>\n' +
    '			</div>\n' +
    '			<div class="thumbnail resource text-center">\n' +
    '				<img ng-src="{{ landmark.shopping.image }}" />\n' +
    '			</div>\n' +
    '		</div>\n' +
    '	</div>\n' +
    '	<!-- end image and stats -->\n' +
    '\n' +
    '	<!-- Features, flavour text and options -->\n' +
    '	<ul class="list-group">\n' +
    '		<li class="list-group-item list-item" ng-repeat="bonus in landmark.bonuses">\n' +
    '			<span class="pull-right text-primary" ng-show="bonus.type">{{ bonus.type | uppercase }}</span>\n' +
    '			<i class="fa" ng-class="bonus.icon"></i> {{ bonus.flavour }}\n' +
    '			<em class="text-muted" ng-show="bonus.implication">\n' +
    '				<small>({{ bonus.implication }})</small>\n' +
    '			</em>\n' +
    '		</li>\n' +
    '	</ul>\n' +
    '	<!-- end features -->\n' +
    '\n' +
    '	<!-- One time bonus -->\n' +
    '	<div class="panel-footer text-center" ng-class="isVisited() ? \'inactive\' : \'active\'">\n' +
    '		One-time visiting bonus:\n' +
    '		<strong>+{{ landmark.exp }} <i class="fa fa-star"></i>\n' +
    '		</strong>\n' +
    '	</div>\n' +
    '	<!-- end bonus -->\n' +
    '\n' +
    '</div>\n' +
    '<!-- end card -->\n' +
    '');
}]);

angular.module('templates/loading.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/loading.tpl.html',
    '<div class="spinner">\n' +
    '	<div class="bounce1"></div>\n' +
    '	<div class="bounce2"></div>\n' +
    '	<div class="bounce3"></div>\n' +
    '</div>\n' +
    '');
}]);

angular.module('templates/maps.game.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/maps.game.tpl.html',
    '<div gm-map\n' +
    '	ng-if="!disabled"\n' +
    '	class="map-canvas"\n' +
    '	gm-map-id="\'gameMap\'"\n' +
    '	gm-center="center"\n' +
    '	gm-zoom="zoom"\n' +
    '	gm-bounds="bounds"\n' +
    '	gm-map-type-id="type"\n' +
    '	gm-on-click="selectPoint(map, event)">\n' +
    '	<div gm-markers\n' +
    '		gm-objects="locations"\n' +
    '		gm-id="object.id"\n' +
    '		gm-marker-options="getMarkerOptions(object)"\n' +
    '		gm-position="{lat: object.coords.lat, lng: object.coords.lng}"\n' +
    '		gm-on-click="selectLocation(object, marker)">\n' +
    '	</div>\n' +
    '	<div gm-markers\n' +
    '		gm-objects="points"\n' +
    '		gm-id="object.id"\n' +
    '		gm-marker-options="getMarkerOptions(object)"\n' +
    '		gm-position="{lat: object.coords.lat, lng: object.coords.lng}"\n' +
    '		gm-on-click="selectLocation(object, marker)">\n' +
    '	</div>\n' +
    '	<div id="map-infoWindow-markerLabel-sample">\n' +
    '		<div class="well">\n' +
    '			<strong>{{ location.name }}</strong>\n' +
    '		</div>\n' +
    '	</div>\n' +
    '</div>\n' +
    '');
}]);

angular.module('templates/random-event-card.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/random-event-card.tpl.html',
    '<!-- Event card -->\n' +
    '<div class="random-event-card panel panel-default random-event-{{ randomEvent.type }} animated"\n' +
    '	state-tracker="randomEventCardState"\n' +
    '	state-class="[\'hide\', \'bounceIn\', \'bounceOut\', \'hide\']"\n' +
    '	state-activate="randomEvent"\n' +
    '	state-on-failed="randomEvent = null"\n' +
    '	state-transition="{complete: {failed: 500}, failed: {idle: 500}}">\n' +
    '\n' +
    '	<!-- Event name and controls -->\n' +
    '	<div class="panel-header panel-heading">\n' +
    '		<h3 ng-if="randomEvent.type === \'POSITIVE\'">Hang on, something great happened today!</h3>\n' +
    '		<h3 ng-if="randomEvent.type === \'NEGATIVE\'">Uh-oh! Something bad happened today!</h3>\n' +
    '	</div>\n' +
    '	<!-- end name and controls -->\n' +
    '\n' +
    '	<!-- Flavour text -->\n' +
    '	<div class="panel-body">\n' +
    '		<h2>{{ randomEvent.description }}</h2>\n' +
    '	</div>\n' +
    '	<!-- end text -->\n' +
    '\n' +
    '	<!-- Impact -->\n' +
    '	<div class="panel-footer">\n' +
    '		<h3>{{ randomEvent.impact }}</h3>\n' +
    '		<p>\n' +
    '			<button type="button" class="btn btn-default" ng-click="close()">Okay</button>\n' +
    '		</p>\n' +
    '	</div>\n' +
    '	<!-- end impact -->\n' +
    '\n' +
    '</div>\n' +
    '<!-- end card -->\n' +
    '');
}]);

angular.module('templates/upgrade-card.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/upgrade-card.tpl.html',
    '<!-- Event card -->\n' +
    '<div class="upgrade-card panel panel-default animated"\n' +
    '	state-tracker="upgradeCardState"\n' +
    '	state-class="[\'hide\', \'bounceIn\', \'bounceOut\', \'hide\']"\n' +
    '	state-activate="upgrade"\n' +
    '	state-on-failed="upgrade = null"\n' +
    '	state-transition="{complete: {failed: 500}, failed: {idle: 500}}">\n' +
    '\n' +
    '	<!-- Event name and controls -->\n' +
    '	<div class="panel-header panel-heading">\n' +
    '		<h3>\n' +
    '			<span class="upgrade-card-label">Unlocked!</span>\n' +
    '			{{ upgrade.name }}\n' +
    '		</h3>\n' +
    '	</div>\n' +
    '	<!-- end name and controls -->\n' +
    '\n' +
    '	<!-- Image and flavour text -->\n' +
    '	<div class="panel-body" ng-style="{\'background-image\': \'url(\' + upgrade.image + \')\'}">\n' +
    '		<h3>{{ upgrade.description }}</h3>\n' +
    '	</div>\n' +
    '	<!-- end image and text -->\n' +
    '\n' +
    '	<!-- Features/impacts -->\n' +
    '	<ul class="list-group">\n' +
    '		<li class="list-group-item list-item" ng-repeat="impact in upgrade.impacts">\n' +
    '			<i class="fa" ng-class="impact.icon"></i> {{ impact.flavour }}\n' +
    '			<em class="text-muted" ng-show="impact.implication">\n' +
    '				<small>({{ impact.implication }})</small>\n' +
    '			</em>\n' +
    '		</li>\n' +
    '	</ul>\n' +
    '	<!-- end features -->\n' +
    '\n' +
    '	<!-- One time bonus -->\n' +
    '	<div class="panel-footer">\n' +
    '		<a ng-href="{{ upgrade.link }}" class="btn btn-link" target="_blank">Learn more</a>\n' +
    '		<button type="button" class="btn btn-default" ng-click="close()">Okay</button>\n' +
    '	</div>\n' +
    '	<!-- end bonus -->\n' +
    '\n' +
    '</div>\n' +
    '<!-- end card -->\n' +
    '');
}]);

angular.module('templates/widgets.alert.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/widgets.alert.tpl.html',
    '<div class="widget-alert" ng-bind-html="content"></div>\n' +
    '<div class="chevron fa fa-caret-down" ng-if="chevron"></div>');
}]);

angular.module('templates/widgets.day-counter.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/widgets.day-counter.tpl.html',
    '<div class="widget-day-counter animated rotateInDownRight" ng-if="now.day">\n' +
    '	<div class="content">\n' +
    '		<h1>Day</h1>\n' +
    '		<h1>{{ now.day | number }}\n' +
    '			<small>/ {{ limits.days }}</small>\n' +
    '		</h1>\n' +
    '	</div>\n' +
    '</div>\n' +
    '');
}]);

angular.module('templates/widgets.resource-indicator.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/widgets.resource-indicator.tpl.html',
    '<div class="widget-resource-indicator"\n' +
    '	ng-class="\'widget-resource-indicator-\' + type"\n' +
    '	state-tracker="resourceIndicatorState_{{ type }}"\n' +
    '	state-class="[\'\', \'animated tada\', \'\', \'\']">\n' +
    '	<i ng-switch on="type" class="widget-resource-indicator-icon">\n' +
    '		<img ng-switch-when="MONEY" src="images/icons/anz_icon_ui_money_small.png" height="64" width="64" />\n' +
    '		<img ng-switch-when="XP" src="images/icons/anz_icon_ui_star_small.png" height="64" width="64" />\n' +
    '		<img ng-switch-when="SOUVENIR" src="images/icons/anz_icon_ui_shopping_small.png" height="64" width="64" />\n' +
    '	</i>\n' +
    '	<span class="widget-resource-indicator-value" ng-bind="getValue()"></span>\n' +
    '</div>\n' +
    '');
}]);
