/**
 * Created by JH_KIM on 2016-04-14.
 */
app.controller('TabController', function ($scope, $rootScope, $http) {

    $scope.tabKey = $rootScope.selectItem.key;
    $scope.tabType = $rootScope.selectItem.type;
    $scope.overlayId = null;
    $scope.peerId = null;
    //$scope.tabData = $rootScope.selectItem.status;
    setTabKey();

    $scope.refreshData = function(){
        $scope.getData();

        if($scope.tabType == $rootScope.tabType.OVERLAY){
            $scope.requestChartData();
        }
    };

    $scope.getData = function(){
        $scope.tabData  = $rootScope.getTabData($scope.overlayId, $scope.peerId);

        if($scope.tabData == null){
            $scope.noDataMessage();
        }
    };

    $scope.requestChartData = function(){
        var req ={
            method :"POST"
            ,url : "GetPieceData"
            ,data : {overlay_network_id : $scope.overlayId}
        };

        $http(req).then(function (response) {
            if (response.data != null) {
                $scope.pieceChartData  = response.data;
            }
        }, function (response) {
            console.log(response);
        })
    };

    $scope.noDataMessage = function(){
        var tabData = null;
        var unKnown = "N/A";
        if($scope.tabType == $rootScope.tabType.OVERLAY){
            tabData = {
                peerCount : unKnown
                ,startedPeer : unKnown
                ,completedPeer : unKnown
                ,activePeer : unKnown
            }
        }
        else{
            tabData = {
                overlayId : $scope.overlayId
                ,peerId : $scope.peerId
                ,reportCount : unKnown
                ,uploaded : unKnown
                ,downloaded : unKnown
                ,totalUploadSpeed : unKnown
                ,totalDownloadSpeed : unKnown
                ,numUploadConnection : unKnown
                ,numDownloadConnection : unKnown
                ,maxNumConnForUp : unKnown
            }
        }
        $scope.tabData = tabData;
    };

    $scope.pieceChartOptions = {
        chart: {
            type: 'multiBarChart',
            height: 150,
            margin: {
                top: 20,
                right: 20,
                bottom: 25,/*45*/
                left: 45
            },
            x: function (d) { return d.peer_id; },
            y: function (d) { return d.value; },
           /* useInteractiveGuideline: true,*/
            dispatch: {
                stateChange: function (e) { console.log("stateChange"); },
                changeState: function (e) { console.log("changeState"); },
                tooltipShow: function (e) { console.log("tooltipShow"); },
                tooltipHide: function (e) { console.log("tooltipHide"); }
            },
            clipEdge: true,
            //staggerLabels: true,
            duration: 500,
            stacked: false, /*true: 1line ,false : ����*/
            xAxis: {
                /*axisLabel: 'Peer ID',*/
                showMaxMin: false
            },
            yAxis: {
                axisLabel: 'Piece Count',
                axisLabelDistance: -20,
                tickFormat: function(d){
                    return d3.format('d')(d);
                }
            },
            callback: function (chart) {
                //console.log("!!! lineChart callback !!!");
            }
        }
    };

    /*var op1 = {
        key : "Upload"
        ,values : [{x:"peer1",y:12},{x:"peer2",y:0},{x:"peer3",y:7},{x:"peer4",y:2},{x:"peer5",y:15}]
        ,color : '#FF7F0E'
    };
    var op2 = {
        key : "Download"
        ,values : [{x:"peer1",y:30},{x:"peer2",y:12},{x:"peer3",y:21},{x:"peer4",y:17},{x:"peer5",y:5}]
        ,color : '#1F77B4'
    };
    $scope.pieceChartData = [op1,op2];*/


    function initTabController() {
        $scope.getData();

        if($scope.tabType == $rootScope.tabType.OVERLAY){
            $scope.overlayId = $rootScope.selectItem.key;
            $scope.requestChartData();
        }
    }

    function setTabKey() {
        var overlayId = null;
        var peerId = null;

        if($rootScope.tabType.OVERLAY == $scope.tabType){
            overlayId = $scope.tabKey;
        } else if($rootScope.tabType.PEER == $scope.tabType){
            var keys = $scope.tabKey.split( $rootScope.splitText );
            if(keys.length > 1){
                peerId = keys[0];
                overlayId = keys[1];
            }
        }

        $scope.overlayId = overlayId;
        $scope.peerId = peerId;
    }

    initTabController();
    window.sc = $scope;
});