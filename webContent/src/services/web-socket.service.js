app.factory("WebSocketService", function ($q, $rootScope, $location) {
	var webSocket = null;
	var isConnected = false;
	var isOpened = false;
	
	function open(port,path) {
		var host = location.hostname;
		if(host == "localhost"){
			host = "127.0.0.1";
		}
		var webSocketUrl = "ws://" + host + ":" + port + "/" + path;

		var webSocket = new WebSocket(webSocketUrl);
		isConnected = true;

		webSocket.onopen = function () {
			isOpened = true;
			console.log("Websocket is opened.");
			
			$rootScope.$broadcast('WebSocketOpened');
		};
		
		webSocket.onmessage = function (message) {
			var messageObject = JSON.parse(message.data);

			if (messageObject.type == "REPORT") {
				$rootScope.peerStatusReportReceived(messageObject.data);
			} else if (messageObject.type == "OVERLAY") {
				$rootScope.overlayChangeEventReceived(messageObject.data);
			} else if (messageObject.type == "PEER") {
				$rootScope.peerChangeEventReceived(messageObject.data);
			}
		};
		
		webSocket.onclose = function () {
			webSocket = null;
			isOpened = false;
			$rootScope.$broadcast('WebSocketClosed');
		};
	}
	
	function close() {
		console.log("WegSocket was closed all.");
		isConnected = false;
		webSocket.close();
		webSocket = null;
	}
	
	function isWebSocketOpened() {
		return isOpened;
	}

	return {
		open: open,
		close: close,
		isWebSocketOpened: isWebSocketOpened
	};
});