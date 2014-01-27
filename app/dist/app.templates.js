angular.module('travelPlanningGame.templates', ['templates/landmark-card.tpl.html', 'templates/maps.game.tpl.html', 'templates/widgets.alert.tpl.html', 'templates/widgets.day-counter.tpl.html', 'templates/widgets.resource-indicator.tpl.html']);

angular.module('templates/landmark-card.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/landmark-card.tpl.html',
    '<!-- Landmark card -->\n' +
    '<div class="landmark-card" ng-class="{flipped : isFlipped}">\n' +
    '\n' +
    '	<!-- Front face -->\n' +
    '	<div class="panel panel-primary landmark-card-face landmark-card-face-front">\n' +
    '\n' +
    '		<!-- Landmark name and controls -->\n' +
    '		<div class="panel-header panel-heading">\n' +
    '\n' +
    '			<!-- Controls -->\n' +
    '			<i class="fa close fa-times fa-fw" ng-click="landmark = null"></i>\n' +
    '			<i class="fa close fa-rotate-left fa-fw" ng-click="isFlipped = !isFlipped"></i>\n' +
    '\n' +
    '			<h3>{{ landmark.name }}</h3>\n' +
    '		</div>\n' +
    '		<!-- end name and controls -->\n' +
    '\n' +
    '		<!-- Image and quick stats -->\n' +
    '		<div class="panel-body" ng-style="{\'background-image\': \'url(\' + landmark.image + \')\'}">\n' +
    '			<div class="col-xs-offset-9">\n' +
    '				<div class="thumbnail resource text-center">\n' +
    '					<small>LODGING</small>\n' +
    '					<h3>{{ landmark.lodgingCost }} <i class="fa fa-dollar"></i>\n' +
    '					</h3>\n' +
    '					<small>PER DAY</small>\n' +
    '				</div>\n' +
    '				<div class="thumbnail resource text-center">\n' +
    '					<small>VISITING</small>\n' +
    '					<h3>{{ landmark.visitingCost }} <i class="fa fa-dollar"></i>\n' +
    '					</h3>\n' +
    '					+{{ landmark.visitingExp }} <i class="fa fa-star"></i>\n' +
    '				</div>\n' +
    '				<div class="thumbnail resource text-center">\n' +
    '					<h3>{{ landmark.souvenirs }} <i class="fa fa-shopping-cart"></i>\n' +
    '					</h3>\n' +
    '					<small>FOR {{ landmark.souvenirCost }} <i class="fa fa-dollar"></i>\n' +
    '					</small>\n' +
    '				</div>\n' +
    '			</div>\n' +
    '		</div>\n' +
    '		<!-- end image and stats -->\n' +
    '\n' +
    '		<!-- Features, flavour text and options -->\n' +
    '		<ul class="list-group">\n' +
    '			<li class="list-group-item list-item" ng-repeat="bonus in landmark.bonuses">\n' +
    '				<span class="pull-right text-primary" ng-show="bonus.type">{{ bonus.type | uppercase }}</span>\n' +
    '				<i class="fa" ng-class="bonus.icon"></i> {{ bonus.flavour }}\n' +
    '				<em class="text-muted" ng-show="bonus.implication">\n' +
    '					<small>({{ bonus.implication }})</small>\n' +
    '				</em>\n' +
    '			</li>\n' +
    '		</ul>\n' +
    '		<!-- end features -->\n' +
    '\n' +
    '		<!-- One time bonus -->\n' +
    '		<div class="panel-footer text-center">\n' +
    '			One-time visiting bonus:\n' +
    '			<strong>+{{ landmark.exp }} <i class="fa fa-star"></i>\n' +
    '			</strong>\n' +
    '		</div>\n' +
    '		<!-- end bonus -->\n' +
    '\n' +
    '	</div>\n' +
    '	<!-- end front face -->\n' +
    '\n' +
    '	<!-- Back face -->\n' +
    '	<div class="panel panel-primary landmark-card-face landmark-card-face-back">\n' +
    '\n' +
    '		<!-- Landmark name and controls -->\n' +
    '		<div class="panel-header panel-heading">\n' +
    '\n' +
    '			<!-- Controls -->\n' +
    '			<i class="fa close fa-times fa-fw" ng-click="landmark = null"></i>\n' +
    '			<i class="fa close fa-rotate-left fa-fw" ng-click="isFlipped = !isFlipped"></i>\n' +
    '\n' +
    '			<h3>{{ landmark.name }}</h3>\n' +
    '		</div>\n' +
    '		<!-- end name and controls -->\n' +
    '\n' +
    '		<!-- Image -->\n' +
    '		<div class="panel-body" ng-style="{\'background-image\': \'url(\' + landmark.image + \')\'}">\n' +
    '			<div class="col-xs-offset-9 invisible">\n' +
    '				<div class="thumbnail resource text-center">\n' +
    '					<small>LODGING</small>\n' +
    '					<h3>{{ landmark.lodgingCost }} <i class="fa fa-dollar"></i>\n' +
    '					</h3>\n' +
    '					<small>PER DAY</small>\n' +
    '				</div>\n' +
    '				<div class="thumbnail resource text-center">\n' +
    '					<small>VISITING</small>\n' +
    '					<h3>{{ landmark.visitingCost }} <i class="fa fa-dollar"></i>\n' +
    '					</h3>\n' +
    '					+{{ landmark.visitingExp }} <i class="fa fa-star"></i>\n' +
    '				</div>\n' +
    '				<div class="thumbnail resource text-center">\n' +
    '					<h3>{{ landmark.souvenirs }} <i class="fa fa-shopping-cart"></i>\n' +
    '					</h3>\n' +
    '					<small>FOR {{ landmark.souvenirCost }} <i class="fa fa-dollar"></i>\n' +
    '					</small>\n' +
    '				</div>\n' +
    '			</div>\n' +
    '		</div>\n' +
    '		<!-- end image -->\n' +
    '\n' +
    '		<!-- Features, flavour text and options -->\n' +
    '		<ul class="list-group">\n' +
    '			<li class="list-group-item list-item">{{ landmark.description }}</li>\n' +
    '		</ul>\n' +
    '		<!-- end features -->\n' +
    '\n' +
    '		<!-- One time bonus -->\n' +
    '		<div class="panel-footer text-center">\n' +
    '			<div class="invisible">\n' +
    '				One-time visiting bonus:\n' +
    '				<strong>+{{ landmark.exp }} <i class="fa fa-star"></i>\n' +
    '				</strong>\n' +
    '			</div>\n' +
    '		</div>\n' +
    '		<!-- end bonus -->\n' +
    '\n' +
    '	</div>\n' +
    '	<!-- end back face -->\n' +
    '\n' +
    '</div>\n' +
    '<!-- end card -->\n' +
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
    '		gm-on-click="selectPoint(map, event)">\n' +
    '	</div>\n' +
    '	<div id="map-infoWindow-markerLabel-sample">\n' +
    '		<div class="well">\n' +
    '			<strong>{{ location.name }}</strong>\n' +
    '		</div>\n' +
    '	</div>\n' +
    '</div>\n' +
    '');
}]);

angular.module('templates/widgets.alert.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/widgets.alert.tpl.html',
    '<div class="widget-alert" ng-transclude></div>\n' +
    '<div class="chevron" ng-class="chevron" ng-if="chevron"></div>');
}]);

angular.module('templates/widgets.day-counter.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/widgets.day-counter.tpl.html',
    '<div class="widget-day-counter">\n' +
    '	<h1>Day</h1>\n' +
    '	<h1>{{ now.day | number }}<small>/ {{ limits.days }}</h1>\n' +
    '</div>\n' +
    '');
}]);

angular.module('templates/widgets.resource-indicator.tpl.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates/widgets.resource-indicator.tpl.html',
    '<div class="widget-resource-indicator" ng-class="\'widget-resource-indicator-\' + type">\n' +
    '	<i class="widget-resource-indicator-icon fa fa-fw fa-3x" ng-class="\'fa-\' + icon"></i>\n' +
    '	<span class="widget-resource-indicator-value" ng-bind="getValue()"></span>\n' +
    '</div>\n' +
    '');
}]);
