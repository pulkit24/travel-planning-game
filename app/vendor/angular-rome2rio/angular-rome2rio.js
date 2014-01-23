angular.module('angular-rome2rio', [])
	.provider('rome2rio', function() {
		'use strict';

		var _settings = {};
		_settings.apiKey = null;
		_settings.apiServer = 'free.rome2rio.com';
		_settings.responseFormat = 'json';
		_settings.apiVersion = '1.2';
		_settings.kind = 'street_address';
		_settings.currency = 'AUD';
		_settings.flags = null;

		///////////////////////////////
		// Configuration functions //
		///////////////////////////////

		this.setKey = function(apiKey) {
			_settings.apiKey = apiKey;
		};
		this.setServer = function(apiServer) {
			_settings.apiServer = apiServer;
		};
		this.setResponseFormat = function(format) {
			_settings.responseFormat = format;
		};
		this.setAPIVersion = function(version) {
			_settings.apiVersion = version;
		};
		this.setCurrency = function(currency) {
			_settings.currency = currency;
		};
		this.setDetailLevel = function(kind) {
			_settings.kind = kind;
		};
		this.setFlags = function(flags) {
			_settings.flags = flags;
		};

		///////////////
		// Factory //
		///////////////

		this.$get = function($q, $http) {

			///////////////////
			// Search API //
			///////////////////

			function _createRequest(oName, dName, oPos, dPos, oKind, dKind, currency, flags) {
				var url = {};
				url.prefix = 'http://';
				url.server = _settings.apiServer;
				url.version = _settings.apiVersion;
				url.format = _settings.responseFormat;
				url.endPoint = 'Search';
				url.key = _settings.apiKey;

				var params = [];
				if (oName) params.push('oName=' + oName);
				if (dName) params.push('dName=' + dName);
				if (oPos) params.push('oPos=' + oPos);
				if (dPos) params.push('dPos=' + dPos);
				if (oKind) params.push('oKind=' + oKind);
				if (dKind) params.push('dKind=' + dKind);
				if (currency) params.push('currency=' + currency);
				if (flags) params.push('flags=' + flags);

				return url.prefix + url.server + '/api/' + url.version + '/' + url.format + '/' + url.endPoint +
					'?key=' + url.key + '&' + params.join('&');
			}

			function search(originName, destinationName, originPosition, destinationPosition) {
				var deferred = $q.defer();
				$http.get(_createRequest(originName, destinationName, originPosition, destinationPosition,
					_settings.kind, _settings.kind, _settings.currency, _settings.flags))

				.success(function(fullResponse) {
					if (_settings.responseFormat === 'json') {
						var routes = fullResponse.routes;

						if (routes) deferred.resolve(_parseRoutes(routes));
						else deferred.reject('No routes available');

					} else deferred.resolve(fullResponse);
				});

				return deferred.promise;
			}

			function toPosition(latitude, longitude) {
				return latitude + ',' + longitude;
			}

			function _parseRoutes(routes) {
				var segments = routes[0].segments;
				var cost = 0;
				var mappablePathSegments = [];

				angular.forEach(segments, function(segment, index) {
					if (angular.isNumber(segment.indicativePrice.price))
						cost += segment.indicativePrice.price;
					mappablePathSegments.push(segment.path);
				});

				function getCost() {
					return cost;
				}

				function getPaths() {
					return mappablePathSegments;
				}

				return {
					getCost: getCost
					, getPaths: getPaths
				};
			}

			return {
				search: search
				, rawRequestURL: _createRequest
				, toPosition: toPosition
			};
		};
	});
