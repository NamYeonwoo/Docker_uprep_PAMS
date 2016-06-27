app.directive('trafficChart', function () {
	return {
		restrict: 'E',
		template:
			'<div data-drop="true" data-jqyoui-options ng-model="chartItem" jqyoui-droppable="{}">' +
			'	<div class="header" ng-hide="!chartItem">' +
			'		<div ng-if="chartItem && chartItem.overlay_network_id" ng-class="{remove : chartItem.remove}">' +
			'			<div>' +
			'				<button type="button" class="close closeChart" ng-click="closeChart(this)"> x </button>' +
			'			</div>' +
			'			<div class="chart-header" >' +
			'				<div ng-class="{black : chartItem.remove}" class="cursor-pointer chart-title text-ellipsis m-r-10" style="display: inline-block" ng-click="createOverlayTab(chartItem)">Overlay : {{chartItem.overlay_network_id}}</div>' +
			'				<div ng-if="chartItem && chartItem.peer_id" style="display: inline-block">' +
			'					<div ng-class="{black : chartItem.remove}" class="cursor-pointer chart-title text-ellipsis"  ng-click="createPeerTab(chartItem)">Peer : {{chartItem.peer_id}}</div>' +
			'				</div>' +
			'			</div>' +
			'		</div>' +
			'	</div>' +
			'	<div class="body">' +
			'		<div ng-if="chartItem && chartItem.peers"><nvd3 ng-hide="!chartItem" options="overlayOptions" data="chartItem.chartData"></nvd3></div>' +
			'		<div ng-if="chartItem && !chartItem.peers"><nvd3 ng-hide="!chartItem" options="peerOptions" data="chartItem.chartData"></nvd3></div>' +
			'	</div>' +
			'</div>',
		link: function(scope) {
			scope.$watch('chartItem', function() {
				//scope.remove = false;
			});

			scope.overlayOptions = {
				chart: {
					type: 'lineChart',
					margin: {
						top: 20,
						right: 20,
						bottom: 40,
						left: 55
					},
					x: function (d) { return d.time; },
					y: function (d) { return d.value; },
					useInteractiveGuideline: true,
					dispatch: {
						stateChange: function (e) { console.log("stateChange"); },
						changeState: function (e) { console.log("changeState"); },
						tooltipShow: function (e) { console.log("tooltipShow"); },
						tooltipHide: function (e) { console.log("tooltipHide"); }
					},
					xAxis: {
						axisLabel: 'Time',
						tickFormat: function(d) {
							return d3.time.format('%M:%S')(new Date(d));
						}
					},
					yAxis: {
						axisLabel: 'peerCount',
						tickFormat: function (d) {
							return d3.format('d')(d);
						},
						axisLabelDistance: -10
					},
					callback: function (chart) {
						//console.log("!!! lineChart callback !!!");
					}
				}
			};
			scope.peerOptions = {
				chart: {
					type: 'lineChart',
					margin: {
						top: 20,
						right: 20,
						bottom: 40,
						left: 55
					},
					x: function (d) { return d.time; },
					y: function (d) { return d.value; },
					useInteractiveGuideline: true,
					dispatch: {
						stateChange: function (e) { console.log("stateChange"); },
						changeState: function (e) { console.log("changeState"); },
						tooltipShow: function (e) { console.log("tooltipShow"); },
						tooltipHide: function (e) { console.log("tooltipHide"); }
					},
					xAxis: {
						axisLabel: 'Time',
						tickFormat: function(d) {
							return d3.time.format('%M:%S')(new Date(d));
						}
					},
					yAxis: {
						axisLabel: '(Kbps)',
						tickFormat: function (d) {
							return d3.format('.02f')(d);
						},
						axisLabelDistance: -10
					},
					callback: function (chart) {
						//console.log("!!! lineChart callback !!!");
					}
				}
			};
		}
	};
});