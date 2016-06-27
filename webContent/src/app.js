'use strict';

var app = angular.module('app', ['nvd3', 'ngDragDrop', 'ui.bootstrap']);

app.controller('MainController', function ($scope, $rootScope, $http, $interval, WebSocketService) {
    window.test = [];
    $rootScope.selectItem = null;
    $rootScope.splitText = "&$&";

    $rootScope.tabType = {
        OVERLAY: "overlay"
        , PEER: "peer"
    };

    $rootScope.actionType = {
        INSERT: "INSERT"
        , DELETE: "DELETE"
        , UPDATE: "UPDATE"
    };


    $scope.tabTypeHtml = {
        OVERLAY: "control/overlayTab.html"
        , PEER: "control/peerTab.html"
    };

    $scope.tabs = [];
    $scope.activeTab = 0;
    $scope.tabIndex = 0;
    $scope.trafficChartList = [];
    $scope.chartDataLength = 50;

    initMainController();


    $rootScope.getTabData = function (overlayId, peerId) {
        var resultData = null;

        for (var i = 0; i < $scope.overlayNetworks.length; i++) {
            var overlay = $scope.overlayNetworks[i];

            if (overlay.overlay_network_id == overlayId) {

                if (peerId == null) {
                    resultData = overlay.status;
                    break;
                }
                else {
                    for (var j = 0; j < overlay.peers.length; j++) {
                        var peer = overlay.peers[j];

                        if (peer.peer_id == peerId) {
                            resultData = peer.status;
                            break;
                        }
                    }
                }
            }
        }
        return resultData;
    };

    $rootScope.overlayChangeEventReceived = function (overlayData) {
        var action = overlayData.action;
        var overlayId = overlayData.overlay_network_id;

        if (action == $rootScope.actionType.INSERT) {
            $scope.addOverlay(overlayId, overlayData.content_type);
        } else if (action == $rootScope.actionType.DELETE) {
            $scope.deleteOverlay(overlayId);
        }
        $scope.$apply();
    };

    $rootScope.peerChangeEventReceived = function (peerData) {
        var action = peerData.action;
        var overlayId = peerData.overlay_network_id;

        if (action == $rootScope.actionType.INSERT) {
            $scope.addPeer(overlayId, peerData);
        } else if (action == $rootScope.actionType.DELETE) {
            $scope.deletePeer(overlayId, peerData.peer_id);
        }
        $scope.$apply();
    };

    $rootScope.peerStatusReportReceived = function (report) {

        var overlayId = report.OVERLAY_NETWORK_ID;
        var peerId = report.PEER_ID;
        var time = report.CURRENT_DATE;
        var peerCount = report.PEER_COUNT;
        var startedPeer = 0;
        var completedPeer = 0;
        var uploadSpeed = report.UPLOAD_SPEED;
        var downloadSpeed = report.DOWNLOAD_SPEED;

        var reportCount = report.SEQUENCE_NUMBER;
        var uploaded = report.UPLOADED;
        var downloaded = report.DOWNLOADED;
        var totalUploadSpeed = report.TOTAL_UPLOAD_SPEED;
        var totalDownloadSpeed = report.TOTAL_DOWNLOAD_SPEED;
        var numUploadConnection = report.NUM_UPLOAD_CONNECTION;
        var numDownloadConnection = report.NUM_DOWNLOAD_CONNECTION;
        var maxNumConnForUp = report.MAX_NUM_CONN_FOR_UP;

        if (report.STARTED_PEER_COUNT != null) {
            startedPeer = report.STARTED_PEER_COUNT;
        }
        if (report.COMPLETED_PEER_COUNT != null) {
            completedPeer = report.COMPLETED_PEER_COUNT;
        }
        var activePeer = startedPeer + completedPeer;

        var overlayReport = {
            time: time
            , input: peerCount
            , output: activePeer
        };

        var peerReport = {
            time: time
            , input: uploadSpeed
            , output: downloadSpeed
        };

        var overlayStatus = {
            overlayId: overlayId
            , peerCount: peerCount
            , startedPeer: startedPeer
            , completedPeer: completedPeer
            , activePeer: activePeer
        };

        var peerStatus = {
            overlayId: overlayId
            , peerId: peerId
            , reportCount: reportCount
            , uploaded: uploaded
            , downloaded: downloaded
            , totalUploadSpeed: totalUploadSpeed
            , totalDownloadSpeed: totalDownloadSpeed
            , numUploadConnection: numUploadConnection
            , numDownloadConnection: numDownloadConnection
            , maxNumConnForUp: maxNumConnForUp
        };

        for (var i = 0; i < $scope.overlayNetworks.length; i++) {
            var overlay = $scope.overlayNetworks[i];

            if (overlay.overlay_network_id == overlayId) {
                overlay.status = overlayStatus;
                addOverlayReport(overlay.chartData, overlayReport);

                for (var j = 0; j < overlay.peers.length; j++) {
                    var peer = overlay.peers[j];

                    if (peer.peer_id == peerId) {
                        peer.status = peerStatus;
                        addPeerReport(peer.chartData, peerReport);
                        break;
                    }
                }

                break;
            }
        }
        $scope.$apply();
    };


    $scope.closeChart = function (item) {
        var data = item.$parent.chartItem;
        var key = null;
        if (data.peer_id != null) {
            key = data.peer_id + $rootScope.splitText + data.overlay_network_id;
        } else {
            key = data.overlay_network_id;
        }

        var index = $scope.findTabIndex(key);
        if (index > -1) {
            $scope.closeTab(index);
        }

        item.$parent.chartItem = null;
    };

    $scope.addOverlay = function (overlayId, contentType) {
        if (contentType == null) {
            contentType = "STREAM";
        }

        var overlayNetwork = {
            "overlay_network_id": overlayId
            , "content_type": contentType
            , "chartData": createOverlayChartData()
            , "peers": []
        };

        $scope.overlayNetworks.push(overlayNetwork);
    };

    $scope.deleteOverlay = function (overlayId) {
        for (var i = 0; i < $scope.overlayNetworks.length; i++) {
            var overlay = $scope.overlayNetworks[i];

            if (overlay.overlay_network_id == overlayId) {
                var removeOverlay = $scope.overlayNetworks.splice(i, 1);
                removeOverlay[0].remove = true;

                for (var j = 0; j < overlay.peers.length; j++) {
                    var peer = overlay.peers[j];
                    peer.remove = true;
                }

                break;
            }
        }
    };

    $scope.addPeer = function (overlayId, peerData) {
        var peer = {
            "overlay_network_id": overlayId
            , "peer_id": peerData.peer_id
            , "type": peerData.type
            , "delegation_id": peerData.delegation_id
            , "chartData": createPeerChartData()
        };

        for (var i = 0; i < $scope.overlayNetworks.length; i++) {
            var overlay = $scope.overlayNetworks[i];

            if (overlay.overlay_network_id == overlayId) {
                overlay.peers.push(peer);
                break;
            }
        }
    };

    $scope.deletePeer = function (overlayId, peerId) {
        for (var i = 0; i < $scope.overlayNetworks.length; i++) {
            var overlay = $scope.overlayNetworks[i];

            if (overlay.overlay_network_id == overlayId) {

                for (var j = 0; j < overlay.peers.length; j++) {
                    var peer = overlay.peers[j];

                    if (peer.peer_id == peerId) {
                        var removePeer = overlay.peers.splice(j, 1);
                        removePeer[0].remove = true;
                        console.log(removePeer);
                        break;
                    }
                }
                break;
            }
        }
    };

    var items = {};
    $scope.getTrafficChartList = function (row) {
        if (items[row] == null) {
            var min = row * 3;
            var max = row * 3 + 3;
            var list = [];
            for (var i = min; i < max; i++) {
                if ($scope.trafficChartList.length <= min) {
                    break;
                }
                list.push($scope.trafficChartList[i]);
            }
            items[row] = list;
            //console.log(row);
        }
        return items[row];
    };
    window.items = items;

    /*
     $scope.broadcastCreateTabEvent = function(itemData){
     $rootScope.$broadcast("createOverlayTab", itemData);
     };
     $scope.$on("createOverlayTab", function (event, data) {
     console.log("MainController");
     console.log(data);
     });
     */

    $scope.createOverlayTab = function (item) {
        var key = item.overlay_network_id;
        var index = $scope.findTab(key);
        if (index > -1) {
            $scope.changeActiveTab(index);
        } else {
            if (item.remove != null) {
                return;
            }
            this.createTab($rootScope.tabType.OVERLAY, key, item);
        }
    };

    $scope.createPeerTab = function (item) {
        var key = item.peer_id + $rootScope.splitText + item.overlay_network_id;
        var index = $scope.findTab(key);
        if (index > -1) {
            $scope.changeActiveTab(index);
        } else {
            if (item.remove != null) {
                return;
            }
            this.createTab($rootScope.tabType.PEER, key, item);
        }
    };

    $scope.findTab = function (key) {
        var index = -1;
        for (var i = 0; i < $scope.tabs.length; i++) {
            var tab = $scope.tabs[i];
            if (tab.key == key) {
                index = tab.index;
                break;
            }
        }
        return index;
    };

    $scope.findTabIndex = function (key) {
        var index = -1;
        for (var i = 0; i < $scope.tabs.length; i++) {
            var tab = $scope.tabs[i];
            if (tab.key == key) {
                index = i;
                break;
            }
        }
        return index;
    };

    $scope.createTab = function (type, key, item) {
        var num = $scope.tabIndex++;
        var content = null;
        var title = null;

        if (type == "overlay") {
            content = this.tabTypeHtml.OVERLAY;
            /*title = item.overlay_network_id.split("-")[0] + "...";*/
            title = item.overlay_network_id;

        } else if (type == "peer") {
            content = this.tabTypeHtml.PEER;
            title = item.peer_id;
            /*title += " / "+  item.overlay_network_id.split("-")[0] + "...";*/
            //title += " / "+  item.overlay_network_id.split("-")[0] + "...";
        }

        var tab = {
            index: num, title: title, content: content, type: type, key: key, status: item.status
        };
        $scope.tabs.push(tab);
    };

    $scope.changeActiveLastTab = function (data) {
        $scope.activeTab = $scope.tabIndex - 1;
        $rootScope.selectItem = data;
    };

    $scope.changeActiveTab = function (index) {
        if (index == null) {
            index = 0;
        }
        $scope.activeTab = index;
    };

    $scope.clickTab = function (index, item) {
        //console.log("clickTab " + index );
    };

    $scope.closeTab = function (index) {
        console.log("closeTab" + index);
        $scope.tabs.splice(index, 1);
    };

    /*$scope.setChartHide = function(item){
     var hide = false;

     if(item != null){
     if(item.remove != null && item.remove){
     hide = true;
     }
     } else {
     hide = true;
     }
     console.log("setChartHide");
     return hide;
     };*/

    function initMainController() {
        initWebSocketService();
        initOverlayAndPeerTreeView();

        for (var i = 0; i < 12; i++) {
            $scope.trafficChartList.push({});
        }
    }

    //'#0054FF', '#47C83E', '#FFE400', '#FF0000'
    function createPeerChartData() {
        return [{
            key: 'Upload Speed', color: '#3C8089', values: []
        }, {
            key: 'Download Speed', color: '#465E60', values: []
        }];
    }

    function createOverlayChartData() {
        return [{
            key: 'Total Peer', color: '#3C8089', values: []
        }, {
            key: 'Activity Peer', color: '#465E60', values: []
        }];
    }


    function addOverlayReport(collection, value) {
        collection[0].values.push({time: value.time, value: value.input});
        if (collection[0].values.length > $scope.chartDataLength) {
            collection[0].values.shift();
        }
        collection[1].values.push({time: value.time, value: value.output});
        if (collection[1].values.length > $scope.chartDataLength) {
            collection[1].values.shift();
        }
    }

    function addPeerReport(collection, value) {
        collection[0].values.push({time: value.time, value: value.input});
        if (collection[0].values.length > $scope.chartDataLength) {
            collection[0].values.shift();
        }
        collection[1].values.push({time: value.time, value: value.output});
        if (collection[1].values.length > $scope.chartDataLength) {
            collection[1].values.shift();
        }
    }

    function initWebSocketService() {
        $http.post('/WebSocketPort').then(function (response) {
            if (response.data != null) {
                var port = 9210;
                if (response.data.WEBSOCKET != null) {
                    port = response.data.WEBSOCKET;
                }
                WebSocketService.open(port, "PAMS");
            }
        }, function (response) {
            console.log(response);
        })
    }

    function initOverlayAndPeerTreeView() {
        $http.post('/OverlayAndPeerList').then(function (response) {

            if (response.data) {
                $scope.overlayNetworks = response.data;
                for (var i = 0; i < $scope.overlayNetworks.length; i++) {
                    var overlayNetwork = $scope.overlayNetworks[i];
                    overlayNetwork.chartData = createOverlayChartData();

                    for (var j = 0; j < overlayNetwork.peers.length; j++) {
                        var peer = overlayNetwork.peers[j];
                        peer.chartData = createPeerChartData();
                    }
                }
            }
            //console.log(response);
        }, function (response) {
            console.log(response);
        });
    }

    window.scope = $scope;
});

app.directive('tabsRepeatDirective', function () {
    return function (scope, element) {
        if (scope.$last) {
            scope.$parent.changeActiveLastTab(scope.tab);
        }
    };
});
