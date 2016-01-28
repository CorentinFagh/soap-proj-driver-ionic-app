angular.module('starter.services', [])
.factory('Paths', function (ApiService, StubService){
	var currentKey = "current-path";
	return {
		get:function(pathId, cbSuccess, cbError){
			
			//StubService.get(pathId, cbSuccess, cbError);

			ApiService.getPath(pathId, cbSuccess, cbError);
			
		},
		setCurrent : function(pathId) {
			window.localStorage[currentKey] = pathId;
		},
		getCurrent : function( cbSuccess, cbError) {
			return ApiService.getPath(window.localStorage[currentKey], cbSuccess, cbError);
		},
		clearCurrent : function(){			
 			window.localStorage[currentKey] = "";
		},
		setCurrentState : function(newStatus, cbSuccess, cbError){
			//StubService.setCurrentState(newStatus, cbSuccess, cbError, currentKey);
			
			var pathId = JSON.parse(window.localStorage[currentKey]);
			ApiService.updateStatus(pathId,newStatus, 
				function(){
					ApiService.getPath(pathId, 
						function(pathFound){
								cbSuccess(pathFound);
						},
						cbError
					);
				}
			, cbError );
		},
		updateLocalData : function(){
			var path = JSON.parse(window.localStorage[currentKey]);
			ApiService.getPath(path.pathId, 
				function(pathFound){
					window.localStorage[currentKey] = JSON.stringify(pathFound);
				},
				function(err){
					console.log("updateLocalData exception !")
				}
			);
		}
	}
})
.factory('PathStatus', function(){
	var status = [
		"En attente de départ",
		"En cours", // ref : signal() du dashcontro
		"Pause",
		"En panne",
		"En réparation",
		"Trajet terminé"
	];
	var statusColor = [
		"calm",
		"balanced",
		"royal",
		"assertive",
		"energized",
		"positive"
	];
	return {
	  get:function(statusId){
		var res = status[statusId];
		if (res) return res;
		return null;
	  },
	  getC:function(statusId){
		var res = statusColor[statusId];
		if (res) return res;
		return null;
	  }
	}
})
.factory('ApiService', function($http){
	var baseUrl = "http://ajanibx.noip.me/soap-project/";

	return {
		updateStatus : function(pathId,newStatus, cbSuccess, cbError){
				var urlPattern = ["/api", "status", pathId, newStatus];
				var url = urlPattern.join("/");
				console.log(url);
				$http.put(url, {}).then(
					function (success) {
						cbSuccess(success.data);
					},
					function (error) {
						if (!error.data) {
							cbError({ status: "Une erreur est survenue. Vérifiez vos paramètres réseaux", err: error.data });
						} else {
							cbError(error.data);
						}
					});
		},
		getPath : function(pathId, cbSuccess, cbError){
				var urlPattern = ["/api", "path", pathId];
				var url = urlPattern.join("/");
				console.log(url);
				$http.get(url).then(
					function (success) {

  						success.data.start_date = new Date(success.data.start_date);
  						success.data.end_date = new Date(success.data.end_date);
  						console.log(url + "  -  SUCCESS")
						cbSuccess(success.data);
					},
					function (error) {
						if (!error.data) {
							cbError({ status: "Une erreur est survenue. Vérifiez vos paramètres réseaux", err: error.data });
						} else {
							cbError(error.data);
						}
					});
		},
		postPosition : function(pathId, position, cbSuccess, cbError){
				var urlPattern = ["/api", "position", pathId, position.coords.latitude, position.coords.longitude, position.timestamp ];
				var url = urlPattern.join("/");
				console.log(url);
				$http.post(url,{}).then(
					function (success) {
						cbSuccess(success.data);
					},
					function (error) {
						if (!error.data) {
							cbError({ status: "Une erreur est survenue. Vérifiez vos paramètres réseaux", err: error.data });
						} else {
							cbError(error.data);
						}
					});
		}
	}
})
.factory('StubService', function(){
	var paths = [{
	    "id": "1",
	    "start_latitude": "44.896582",
	    "start_longitude": "-0.970305",
	    "end_latitude": "44.855111",
	    "end_longitude": "-0.131080",
	    "status": "0",
	    "start_date": "2015-12-12 00:00:00",
	    "end_date": "0000-00-00 00:00:00",
	    "driver": {
	        "id": "1",
	        "name": "Eliott",
	        "phone": "06 28 11 11 11"
	    },
	    "truck": {
	        "id": "1",
	        "immatriculation": "AZERTYY"
	    }
	}]; 

	return {
		get:function(pathId, cbSuccess, cbError){
			for (var i = 0; i < paths.length; i++) {
				if (parseInt(paths[i].id) === parseInt(pathId)) {
					var res = paths[i];
					res.start_date = new Date(res.start_date);
					res.status = parseInt(res.status);
					cbSuccess(res);
					return;
				}
			}
			cbError("aucun trajet trouvé");
		},
		setCurrentState : function(newStatus, cbSuccess, cbError,currentKey){
			var path = JSON.parse(window.localStorage[currentKey]);

			path.status = newStatus;

			window.localStorage[currentKey] = JSON.stringify(path);
			cbSuccess();
		}
	}
})
.factory('Clock',function(){
	var intervalTask = null;
	return {
		launch : function(cb){
			var interval = 60 * 1000; // 10 secondes
			if (intervalTask){
				clearInterval(intervalTask);
				intervalTask = null;
			}
			intervalTask = setInterval(function(){
				cb(new Date());
			}, interval);
		},
		stop : function(){
			if (intervalTask){
				clearInterval(intervalTask);
				intervalTask = null;
			}
		}
	}
})
;