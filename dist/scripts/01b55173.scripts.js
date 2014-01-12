angular.module("travelPlanningGame.templates",["templates/landmark-card.tpl.html","templates/maps.game.tpl.html","templates/maps.locationpreview.tpl.html","templates/widgets.day-counter.tpl.html","templates/widgets.resource-indicator.tpl.html"]),angular.module("templates/landmark-card.tpl.html",[]).run(["$templateCache",function(a){"use strict";a.put("templates/landmark-card.tpl.html",'<!-- Landmark card -->\n<div class="landmark-card" ng-class="{flipped : isFlipped}">\n\n	<!-- Front face -->\n	<div class="panel panel-primary landmark-card-face landmark-card-face-front">\n\n		<!-- Landmark name and controls -->\n		<div class="panel-header panel-heading">\n\n			<!-- Controls -->\n			<i class="fa close fa-times fa-fw" ng-click="landmark = null"></i>\n			<i class="fa close fa-rotate-left fa-fw" ng-click="isFlipped = !isFlipped"></i>\n\n			<h3>{{ landmark.name }}</h3>\n		</div>\n		<!-- end name and controls -->\n\n		<!-- Image and quick stats -->\n		<div class="panel-body" ng-style="{\'background-image\': \'url(\' + landmark.image + \')\'}">\n			<div class="col-xs-offset-9">\n				<div class="thumbnail resource text-center">\n					<small>LODGING</small>\n					<h3>{{ landmark.lodgingCost }} <i class="fa fa-dollar"></i>\n					</h3>\n					<small>PER DAY</small>\n				</div>\n				<div class="thumbnail resource text-center">\n					<small>VISITING</small>\n					<h3>{{ landmark.visitingCost }} <i class="fa fa-dollar"></i>\n					</h3>\n					+{{ landmark.visitingExp }} <i class="fa fa-star"></i>\n				</div>\n				<div class="thumbnail resource text-center">\n					<h3>{{ landmark.souvenirs }} <i class="fa fa-shopping-cart"></i>\n					</h3>\n					<small>FOR {{ landmark.souvenirCost }} <i class="fa fa-dollar"></i>\n					</small>\n				</div>\n			</div>\n		</div>\n		<!-- end image and stats -->\n\n		<!-- Features, flavour text and options -->\n		<ul class="list-group">\n			<li class="list-group-item list-item" ng-repeat="bonus in landmark.bonuses">\n				<span class="pull-right text-primary" ng-show="bonus.type">{{ bonus.type | uppercase }}</span>\n				<i class="fa" ng-class="bonus.icon"></i> {{ bonus.flavour }}\n				<em class="text-muted" ng-show="bonus.implication">\n					<small>({{ bonus.implication }})</small>\n				</em>\n			</li>\n		</ul>\n		<!-- end features -->\n\n		<!-- One time bonus -->\n		<div class="panel-footer text-center">\n			One-time visiting bonus:\n			<strong>+{{ landmark.exp }} <i class="fa fa-star"></i>\n			</strong>\n		</div>\n		<!-- end bonus -->\n\n	</div>\n	<!-- end front face -->\n\n	<!-- Back face -->\n	<div class="panel panel-primary landmark-card-face landmark-card-face-back">\n\n		<!-- Landmark name and controls -->\n		<div class="panel-header panel-heading">\n\n			<!-- Controls -->\n			<i class="fa close fa-times fa-fw" ng-click="landmark = null"></i>\n			<i class="fa close fa-rotate-left fa-fw" ng-click="isFlipped = !isFlipped"></i>\n\n			<h3>{{ landmark.name }}</h3>\n		</div>\n		<!-- end name and controls -->\n\n		<!-- Image -->\n		<div class="panel-body" ng-style="{\'background-image\': \'url(\' + landmark.image + \')\'}">\n			<div class="col-xs-offset-9 invisible">\n				<div class="thumbnail resource text-center">\n					<small>LODGING</small>\n					<h3>{{ landmark.lodgingCost }} <i class="fa fa-dollar"></i>\n					</h3>\n					<small>PER DAY</small>\n				</div>\n				<div class="thumbnail resource text-center">\n					<small>VISITING</small>\n					<h3>{{ landmark.visitingCost }} <i class="fa fa-dollar"></i>\n					</h3>\n					+{{ landmark.visitingExp }} <i class="fa fa-star"></i>\n				</div>\n				<div class="thumbnail resource text-center">\n					<h3>{{ landmark.souvenirs }} <i class="fa fa-shopping-cart"></i>\n					</h3>\n					<small>FOR {{ landmark.souvenirCost }} <i class="fa fa-dollar"></i>\n					</small>\n				</div>\n			</div>\n		</div>\n		<!-- end image -->\n\n		<!-- Features, flavour text and options -->\n		<ul class="list-group">\n			<li class="list-group-item list-item">{{ landmark.description }}</li>\n		</ul>\n		<!-- end features -->\n\n		<!-- One time bonus -->\n		<div class="panel-footer text-center">\n			<div class="invisible">\n				One-time visiting bonus:\n				<strong>+{{ landmark.exp }} <i class="fa fa-star"></i>\n				</strong>\n			</div>\n		</div>\n		<!-- end bonus -->\n\n	</div>\n	<!-- end back face -->\n\n</div>\n<!-- end card -->\n')}]),angular.module("templates/maps.game.tpl.html",[]).run(["$templateCache",function(a){"use strict";a.put("templates/maps.game.tpl.html",'<div gm-map\n	ng-if="isEnabled()"\n	class="map-canvas"\n	gm-map-id="\'gameMap\'"\n	gm-center="center"\n	gm-zoom="zoom"\n	gm-bounds="bounds"\n	gm-map-type-id="type">\n	<div gm-markers\n		gm-objects="availableLocations"\n		gm-id="object.id"\n		gm-position="{lat: object.coords.lat, lng: object.coords.lng}"\n		gm-on-click="selectLocation(object, marker)">\n	</div>\n</div>\n')}]),angular.module("templates/maps.locationpreview.tpl.html",[]).run(["$templateCache",function(a){"use strict";a.put("templates/maps.locationpreview.tpl.html",'<div gm-map\n	ng-if="isEnabled()"\n	class="map-canvas"\n	gm-map-id="\'locationPreviewMap\'"\n	gm-center="center"\n	gm-zoom="zoom"\n	gm-bounds="bounds"\n	gm-map-type-id="type">\n	<div gm-markers\n		gm-objects="availableLocations"\n		gm-id="object.id"\n		gm-position="{lat: object.coords.lat, lng: object.coords.lng}"\n		gm-on-click="selectLocation(object, marker)">\n	</div>\n</div>\n')}]),angular.module("templates/widgets.day-counter.tpl.html",[]).run(["$templateCache",function(a){"use strict";a.put("templates/widgets.day-counter.tpl.html",'<div class="widget-day-counter">\n	<h1>Day</h1>\n	<h1>{{ ngModel | number }}<small>/ {{ total }}</h1>\n</div>\n')}]),angular.module("templates/widgets.resource-indicator.tpl.html",[]).run(["$templateCache",function(a){"use strict";a.put("templates/widgets.resource-indicator.tpl.html",'<div class="widget-resource-indicator" ng-class="\'widget-resource-indicator-\' + role">\n	<i class="widget-resource-indicator-icon fa fa-fw fa-3x" ng-click="ngModel = ngModel + 1" ng-class="\'fa-\' + icon"></i>\n	<span class="widget-resource-indicator-value">{{ ngModel | number }}</span>\n</div>\n')}]),angular.module("travelPlanningGame.settings",[]),angular.module("travelPlanningGame.maps",["AngularGM","travelPlanningGame.templates"]),angular.module("travelPlanningGame.widgets",["AngularGM","travelPlanningGame.templates"]),angular.module("travelPlanningGame.app",["ngCookies","ngResource","ngSanitize","ngRoute","ui.bootstrap","angular-underscore","travelPlanningGame.settings","travelPlanningGame.maps","travelPlanningGame.widgets","travelPlanningGame.templates"]).config(["$routeProvider",function(a){a.when("/start",{templateUrl:"views/start.html",controller:"StartCtrl"}).when("/play",{templateUrl:"views/play.html",controller:"PlayCtrl"}).when("/end",{templateUrl:"views/end.html",controller:"EndCtrl"}).otherwise({redirectTo:"/start"})}]),angular.module("travelPlanningGame.app").controller("MainCtrl",["$scope",function(a){a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}]),angular.module("travelPlanningGame.app").controller("StartCtrl",["$scope","gameSettings",function(a,b){function c(){a.settings.game=b.getSettings()}a.settings={},c()}]),angular.module("travelPlanningGame.app").controller("PlayCtrl",["$scope","gameSettings","landmarks","days",function(a,b,c,d){function e(){a.settings.game=b.getSettings(),a.landmarks=c.getLandmarks(),a.play.settings={},a.play.settings.finances={},a.play.settings.finances.totalExpense=0,a.play.settings.finances.funds=a.settings.game.finances.budget-a.play.settings.finances.totalExpense,a.play.settings.gains={},a.play.settings.gains.xp=0,a.play.settings.gains.souvenirs=0,a.play.day=1}a.settings={},a.landmarks=[],a.play={},e(),a.simulateDay=function(){var b=d.newDay(a.play.settings.finances.budget).addLandmark(a.selectedLandmark).end();a.play.settings.finances.totalExpense+=b.getTotalExpenses(),a.play.settings.finances.funds-=a.play.settings.finances.totalExpense,a.play.settings.gains.xp+=b.gains.xp,a.play.settings.gains.souvenirs+=b.gains.souvenirs,a.play.day++}}]),angular.module("travelPlanningGame.app").controller("EndCtrl",["$scope",function(a){a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}]),angular.module("travelPlanningGame.app").factory("landmarks",function(){var a=[{name:"Sentosa",address:"8 Sentosa Gateway, Singapore 098269",description:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.",image:"http://d3n8a8pro7vhmx.cloudfront.net/wearecrown/pages/15/attachments/original/1359687509/crown_casino_fire_show.jpg?1359687509",lodgingCost:200,visitingCost:100,visitingExp:5,souvenirs:5,souvenirCost:150,exp:20,bonuses:[{flavour:"Entertainment complex",implication:"high experience points",icon:"fa-star"},{flavour:"Luxury restaurants and shopping centre",implication:"costly visiting and shopping",icon:"fa-money"},{flavour:"Gambling hub",implication:"spend $700 and roll two dice: win $100 times the result",icon:"fa-trophy",type:"optional"}]},{name:"Pulau Ubin",address:"Pulau Ubin, Singapore",description:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.",image:"http://d3n8a8pro7vhmx.cloudfront.net/wearecrown/pages/15/attachments/original/1359687509/crown_casino_fire_show.jpg?1359687509",lodgingCost:200,visitingCost:100,visitingExp:5,souvenirs:5,souvenirCost:150,exp:20,bonuses:[{flavour:"Entertainment complex",implication:"high experience points",icon:"fa-star"},{flavour:"Luxury restaurants and shopping centre",implication:"costly visiting and shopping",icon:"fa-money"},{flavour:"Gambling hub",implication:"spend $700 and roll two dice: win $100 times the result",icon:"fa-trophy",type:"optional"}]},{name:"Marina Bay",address:"Marina Bay, Singapore",description:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.",image:"http://d3n8a8pro7vhmx.cloudfront.net/wearecrown/pages/15/attachments/original/1359687509/crown_casino_fire_show.jpg?1359687509",lodgingCost:200,visitingCost:100,visitingExp:5,souvenirs:5,souvenirCost:150,exp:20,bonuses:[{flavour:"Entertainment complex",implication:"high experience points",icon:"fa-star"},{flavour:"Luxury restaurants and shopping centre",implication:"costly visiting and shopping",icon:"fa-money"},{flavour:"Gambling hub",implication:"spend $700 and roll two dice: win $100 times the result",icon:"fa-trophy",type:"optional"}]},{name:"Bukit Batok Nature Park",address:"Bukit Batok Nature Park, Singapore",description:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.",image:"http://d3n8a8pro7vhmx.cloudfront.net/wearecrown/pages/15/attachments/original/1359687509/crown_casino_fire_show.jpg?1359687509",lodgingCost:200,visitingCost:100,visitingExp:5,souvenirs:5,souvenirCost:150,exp:20,bonuses:[{flavour:"Entertainment complex",implication:"high experience points",icon:"fa-star"},{flavour:"Luxury restaurants and shopping centre",implication:"costly visiting and shopping",icon:"fa-money"},{flavour:"Gambling hub",implication:"spend $700 and roll two dice: win $100 times the result",icon:"fa-trophy",type:"optional"}]},{name:"Mandai Lake",address:"80 Mandai Lake Rd, Singapore 729826",description:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.",image:"http://d3n8a8pro7vhmx.cloudfront.net/wearecrown/pages/15/attachments/original/1359687509/crown_casino_fire_show.jpg?1359687509",lodgingCost:200,visitingCost:100,visitingExp:5,souvenirs:5,souvenirCost:150,exp:20,bonuses:[{flavour:"Entertainment complex",implication:"high experience points",icon:"fa-star"},{flavour:"Luxury restaurants and shopping centre",implication:"costly visiting and shopping",icon:"fa-money"},{flavour:"Gambling hub",implication:"spend $700 and roll two dice: win $100 times the result",icon:"fa-trophy",type:"optional"}]}],b={};return b.getLandmarks=function(){return a},b}),angular.module("travelPlanningGame.settings").factory("gameSettings",function(){var a={};a.finances={},a.finances.budget=5e3,a.finances.upgradesAvailable={},a.finances.upgradesAvailable.travelCard=!1,a.locations=[{city:"Singapore",country:"Singapore",enabled:!0},{city:"Tokyo",country:"Japan",enabled:!1},{city:"Melbourne",country:"Australia",enabled:!1}],a.selectedLocation=0,a.daysOfTravel=3,a.sandboxMode=!1;var b={};return b.getSettings=function(){return a},b}),angular.module("travelPlanningGame.settings").factory("userSettings",function(){var a=42;return{someMethod:function(){return a}}}),angular.module("travelPlanningGame.maps").factory("mapGeocoder",["$q","angulargmUtils",function(a,b){var c=new google.maps.Geocoder,d={};return d.toCoords=function(d){var e=a.defer();return c.geocode({address:d},function(a){e.resolve(b.latLngToObj(a[0].geometry.location))}),e.promise},d.toAddress=function(b){var d=a.defer();return c.geocode({latLng:b},function(a){d.resolve(a[0].formatted_address)}),d.promise},d}]),angular.module("travelPlanningGame.maps").directive("locationPreviewMap",function(){return{templateUrl:"templates/maps.locationpreview.tpl.html",restrict:"EA",scope:{selectedLocation:"=",availableLocations:"="},link:function(a,b){a.isEnabled=function(){return!b.attr("disabled")}},controller:["$scope","$q","angulargmContainer","angulargmUtils","mapGeocoder",function(a,b,c,d,e){a.zoom=2,a.type="roadmap",a.selectLocation=function(b){a.selectedLocation=b.id},c.getMapPromise("locationPreviewMap").then(function(b){b.mapTypeId=a.type,b.zoom=a.zoom,angular.forEach(a.availableLocations,function(c,d){c.id=d,e.toCoords(c.country+", "+c.city).then(function(e){c.coords=angular.copy(e),d===a.selectedLocation&&b.setCenter(e),a.$broadcast("gmMarkersUpdate")})})})}]}}),angular.module("travelPlanningGame.maps").directive("gameMap",function(){return{templateUrl:"templates/maps.game.tpl.html",restrict:"EA",scope:{focalPoint:"=",ngModel:"=",availableLocations:"="},link:function(a,b){a.isEnabled=function(){return!b.attr("disabled")}},controller:["$scope","$q","angulargmContainer","angulargmUtils","mapGeocoder",function(a,b,c,d,e){a.zoom=12,a.type="roadmap",a.bounds=new google.maps.LatLngBounds,a.selectLocation=function(b){a.ngModel=b},c.getMapPromise("gameMap").then(function(b){b.mapTypeId=a.type,b.zoom=a.zoom,angular.forEach(a.availableLocations,function(c,f){c.id=f,e.toCoords(c.address).then(function(e){c.coords=angular.copy(e),a.bounds.extend(d.objToLatLng(e)),f===a.availableLocations.length-1&&(b.fitBounds(a.bounds),a.$broadcast("gmMarkersUpdate"))})}),a.$watch("focalPoint",function(a){a&&a.lat&&a.lng&&b.panTo(d.objToLatLng(a))})})}]}}),angular.module("travelPlanningGame.app").factory("days",["$filter",function(a){function b(b){var d=a("find")(c,function(c){return a("find")(c.landmarksVisited,function(a){return a.id===b.id})});return angular.isDefined(d)}var c=[],d={};return d.getAllDays=function(){return c},d.getDay=function(a){return c[a]},d.newDay=function(a){var d={};return d.finances={},d.finances.budget=a,d.finances.expenses={},d.finances.expenses.general=0,d.finances.expenses.shopping=0,d.finances.expenses.random=0,d.landmarksVisited=[],d.gains={},d.gains.xp=0,d.gains.souvenirs=0,d.addLandmark=function(a){return this.landmarksVisited.push(a),b(a)||(this.gains.xp+=a.exp),this.gains.xp+=a.visitingExp,this.finances.expenses.general+=a.visitingCost+a.lodgingCost,this},d.addGeneralExpense=function(a){return this.finances.expenses.general+=a,this},d.addShopping=function(a,b){return this.finances.expense.shopping+=b,this.gains.souvenirs+=a,this},d.end=function(){return c.push(this),d},d.getTotalExpenses=function(){return this.finances.expenses.general+this.finances.expenses.shopping+this.finances.expenses.random},d},d}]),angular.module("travelPlanningGame.app").directive("landmarkCard",function(){return{restrict:"EA",transclude:!0,scope:{landmark:"="},templateUrl:"templates/landmark-card.tpl.html"}}),angular.module("travelPlanningGame.widgets").directive("widgetResourceIndicator",function(){return{restrict:"EA",templateUrl:"templates/widgets.resource-indicator.tpl.html",scope:{ngModel:"=",role:"@"},link:function(a){a.icon="budget"===a.role?"dollar":"xp"===a.role?"star":"shopping-cart"}}}).directive("widgetDayCounter",function(){return{restrict:"EA",templateUrl:"templates/widgets.day-counter.tpl.html",scope:{ngModel:"=",total:"="}}});